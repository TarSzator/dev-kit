import { basename, relative, resolve, dirname } from 'path';
import { getInternalNodeService } from '../../utils/services.js';
import { getLog } from '../../utils/log.js';
import { execute } from '../../utils/execute.js';
import InvalidInputError from '../../utils/errors/InvalidInputError.js';
import { endWith, isNonEmptyString } from '../../utils/validators.js';
import { exists, getFileStats, readFile, removeFile } from '../../utils/fs.js';
import { EnvironmentError } from '../../utils/errors/index.js';
import { updateService } from '../internal/tools/dockerCompose.js';

const log = getLog('link');

// [RS] npm link does not work with build via containers due to docker not following symlinks outside context
// [RS] (also on a side note: npm link does not work with prefix option)

export async function link({ pwd, params: [sourceServiceName, targetServiceName] = [] }) {
  if (!isNonEmptyString(sourceServiceName)) {
    throw new InvalidInputError(1618341067, 'No source service name provided');
  }
  if (!isNonEmptyString(targetServiceName)) {
    throw new InvalidInputError(1618341103, 'No target service name provided');
  }
  const sourceProjectPath = await getValidProjectPath({
    serviceName: sourceServiceName,
    pwd,
    isKey: 'isLinkSource',
  });
  const targetProjectPath = await getValidProjectPath({
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
      targetProjectPath,
      sourceProjectPath,
    }),
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
  log.info(`... linked ${sourceServiceName} into ${targetServiceName}.`);
}

async function getValidProjectPath({ serviceName, pwd, isKey }) {
  const { projectPath, [isKey]: isValue } = await getInternalNodeService({
    serviceName,
    pwd,
  });
  if (!isValue) {
    throw new InvalidInputError(
      1618597540,
      `Invalid service "${serviceName}" used. It must be "${isKey}."`
    );
  }
  return projectPath;
}

function getServiceConfigProcessor({ targetServiceName, targetProjectPath, sourceProjectPath }) {
  return async ({ serviceConfig: sc }) => {
    let changed = false;
    const { working_dir: workingDir, volumes = [] } = sc;
    const serviceConfig = { ...sc };
    if (workingDir !== targetProjectPath) {
      serviceConfig.working_dir = targetProjectPath;
      changed = true;
    }
    serviceConfig.volumes = [...volumes];
    if (injectVolume(targetServiceName, targetProjectPath, serviceConfig.volumes)) {
      changed = true;
    }
    if (injectVolume(targetServiceName, sourceProjectPath, serviceConfig.volumes)) {
      changed = true;
    }
    return { changed, serviceConfig };
  };
}

// [RS] Caution this function is mutating the volumes array
function injectVolume(serviceName, projectPath, volumes) {
  const folderName = basename(projectPath);
  const volumeConfig = `${projectPath}:${projectPath}`;
  const projectVolumes = volumes.filter((path) => endWith(path, folderName));
  if (!projectVolumes.length) {
    volumes.push(volumeConfig);
    return true;
  }
  if (projectVolumes.length > 1) {
    throw new EnvironmentError(
      1619592018,
      `Volume for "${folderName}" is not unique in docker compose service config of service "${serviceName}"`
    );
  }
  const [path] = projectVolumes;
  if (path === volumeConfig) {
    return false;
  }
  const index = volumes.indexOf(path);
  volumes.splice(index, 1, volumeConfig);
  return true;
}

async function determineModuleName({ sourceProjectPath }) {
  const packageJson = await readFile(resolve(sourceProjectPath, './package.json'));
  return JSON.parse(packageJson).name;
}
