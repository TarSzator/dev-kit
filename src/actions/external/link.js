import { relative, resolve, dirname } from 'path';
import { getInternalNodeService } from '../../utils/services.js';
import { getLog } from '../../utils/log.js';
import { execute } from '../../utils/execute.js';
import { InvalidInputError, EnvironmentError } from '../../utils/errors/index.js';
import { isNonEmptyString, isTruthy } from '../../utils/validators.js';
import { exists, getFileStats, readFile, removeFile } from '../../utils/fs.js';
import { updateService } from '../internal/tools/dockerCompose.js';
import { restart } from './restart.js';
import { install } from './install.js';

const log = getLog('link');

// [RS] npm link does not work with build via containers due to docker not following symlinks outside context
// [RS] (also on a side note: npm link does not work with prefix option)

export async function link({
  pwd,
  params: [sourceServiceName, targetServiceName] = [],
  options: { skipRestart = false, forceOmittedInstall = false, forceDevOmit = false },
} = {}) {
  if (!isNonEmptyString(sourceServiceName)) {
    throw new InvalidInputError(1618341067, 'No source service name provided');
  }
  if (!isNonEmptyString(targetServiceName)) {
    throw new InvalidInputError(1618341103, 'No target service name provided');
  }
  if (isTruthy(forceDevOmit) && !isTruthy(forceOmittedInstall)) {
    throw new InvalidInputError(
      1660894101,
      'If forceDevOmit is set, forceOmittedInstall must be set as well'
    );
  }
  const { projectPath: sourceProjectPath, localPathKey: sourceLocalPathKey } =
    await getValidProjectPath({
      serviceName: sourceServiceName,
      pwd,
      isKey: 'isLinkSource',
    });
  const { projectPath: targetProjectPath, localPathKey: targetLocalPathKey } =
    await getValidProjectPath({
      serviceName: targetServiceName,
      pwd,
      isKey: 'isLinkTarget',
    });
  log.info(`Link ${sourceServiceName} into ${targetServiceName} ...`);
  await updateService({
    pwd,
    serviceName: targetServiceName,
    processor: getServiceConfigProcessor({
      targetServiceName,
      targetLocalPathKey,
      sourceLocalPathKey,
    }),
  });
  await updateService({
    pwd,
    serviceName: 'dev-kit',
    processor: getDevKitServiceConfigProcessor({ sourceLocalPathKey }),
  });
  const moduleName = await determineModuleName({ sourceProjectPath });
  const nmFolder = `${targetProjectPath}/node_modules/${moduleName}`;
  if (!(await exists(nmFolder))) {
    log.info(`... module "${moduleName}" not installed or linked yet ...`);
  } else {
    const { isDirectory, isSymLink } = await getFileStats(nmFolder);
    if (isSymLink) {
      log.info(`... removing previous linked module "${moduleName}" removed ...`);
      const command = `rm ${nmFolder}`;
      log.info(command);
      await execute({ command, pwd });
      log.info(`... previous linked module "${moduleName}" removed ...`);
    } else if (isDirectory) {
      log.info(`... removing previous installed module "${moduleName}" removed ...`);
      await removeFile(nmFolder);
      log.info(`... previous installed module "${moduleName}" removed ...`);
    } else {
      throw new EnvironmentError(
        1618342300,
        `Current state of the source service install in the target service is unclear. Please check manually. Path: ${nmFolder}`
      );
    }
  }
  const command = `ln -s ${relative(dirname(nmFolder), sourceProjectPath)} ${nmFolder}`;
  log.info(command);
  await execute({ command, pwd });
  log.info(`... linked ${sourceServiceName} into ${targetServiceName} ...`);
  if (isTruthy(forceOmittedInstall)) {
    await install({
      pwd,
      params: [sourceServiceName],
      options: { omitPeer: true, omitDev: isTruthy(forceDevOmit), omitOptional: true },
    });
  }
  if (!isTruthy(skipRestart)) {
    await restart({ pwd, params: [targetServiceName], options: { skipTail: true } });
  }
  log.info('... linking done.');
}

async function getValidProjectPath({ serviceName, pwd, isKey }) {
  const {
    projectPath,
    localPathKey,
    [isKey]: isValue,
  } = await getInternalNodeService({
    serviceName,
    pwd,
  });
  if (!isValue) {
    throw new InvalidInputError(
      1618597540,
      `Invalid service "${serviceName}" used. It must be "${isKey}."`
    );
  }
  return { projectPath, localPathKey };
}

function getServiceConfigProcessor({ targetServiceName, targetLocalPathKey, sourceLocalPathKey }) {
  return async ({ serviceConfig: sc }) => {
    let changed = false;
    const sourceLocalPathVar = `$${sourceLocalPathKey}`;
    const targetLocalPathVar = `$${targetLocalPathKey}`;
    const { working_dir: workingDir } = sc;
    const serviceConfig = copyConfig(sc);
    if (workingDir !== targetLocalPathVar) {
      serviceConfig.working_dir = targetLocalPathVar;
      changed = true;
    }
    if (injectVolume(targetServiceName, targetLocalPathVar, serviceConfig.volumes)) {
      changed = true;
    }
    if (injectVolume(targetServiceName, sourceLocalPathVar, serviceConfig.volumes)) {
      changed = true;
    }
    return { changed, serviceConfig };
  };
}

// [RS] Caution this function is mutating the volumes array
function injectVolume(serviceName, projectPathVar, volumes) {
  const volumeConfig = `${projectPathVar}:${projectPathVar}`;
  const projectVolumes = volumes.filter((path) => path === volumeConfig);
  if (!projectVolumes.length) {
    volumes.push(volumeConfig);
    return true;
  }
  if (projectVolumes.length > 1) {
    throw new EnvironmentError(
      1619592018,
      `Volume for "${projectPathVar}" is not unique in docker compose service config of service "${serviceName}"`
    );
  }
  return false;
}

async function determineModuleName({ sourceProjectPath }) {
  const packageJson = await readFile(resolve(sourceProjectPath, './package.json'));
  return JSON.parse(packageJson).name;
}

function getDevKitServiceConfigProcessor({ sourceLocalPathKey }) {
  return async ({ serviceConfig: sc }) => {
    let changed = false;
    const sourceLocalPathVar = `$${sourceLocalPathKey}`;
    const serviceConfig = copyConfig(sc);
    if (injectVolume('dev-kit', sourceLocalPathVar, serviceConfig.volumes)) {
      changed = true;
    }
    return { changed, serviceConfig };
  };
}

function copyConfig(serviceConfig) {
  const { volumes = [] } = serviceConfig;
  const sc = { ...serviceConfig };
  sc.volumes = [...volumes];
  return sc;
}
