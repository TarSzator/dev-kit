import { basename } from 'path';
import { getInternalNodeService } from '../../utils/services.js';
import { getLog } from '../../utils/log.js';
import { execute } from '../../utils/execute.js';
import InvalidInputError from '../../utils/errors/InvalidInputError.js';
import { isNonEmptyString } from '../../utils/validators.js';
import { exists, getFileStats, removeFile } from '../../utils/fs.js';
import { EnvironmentError } from '../../utils/errors/index.js';

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
  const { localPath: sourceLocalPath, projectPath: sourceProjectPath } = await getValidProjectPath({
    serviceName: sourceServiceName,
    pwd,
    isKey: 'isLinkSource',
  });
  const { projectPath: targetProjectPath } = await getValidProjectPath({
    serviceName: targetServiceName,
    pwd,
    isKey: 'isLinkTarget',
  });
  log.info(`Link ${sourceServiceName} into ${targetServiceName} ...`);
  const moduleName = `@sgorg/${basename(sourceProjectPath)}`;
  const nmFolder = `${targetProjectPath}/node_modules/${moduleName}`;
  if (!(await exists(nmFolder))) {
    log.info(`... module "${moduleName}" not installed or linked yet ...`);
  } else {
    const { isDirectory, isSymLink } = await getFileStats(nmFolder);
    if (isSymLink) {
      await removeFile(nmFolder);
      log.info(`... previous linked module "${moduleName}" removed ...`);
    } else if (isDirectory) {
      await removeFile(nmFolder);
      log.info(`... previous installed module "${moduleName}" removed ...`);
    } else {
      throw new EnvironmentError(
        1618342300,
        `Current state of the source service install in the target service is unclear. Please check manually. Path: ${nmFolder}`
      );
    }
  }
  const command = `ln -s ../../${sourceLocalPath} ${nmFolder}`;
  log.info(command);
  await execute({ command, pwd });
  log.info(`... linked ${sourceServiceName} into ${targetServiceName}.`);
}

async function getValidProjectPath({ serviceName, pwd, isKey }) {
  const { localPath, projectPath, [isKey]: isValue } = await getInternalNodeService({
    serviceName,
    pwd,
  });
  if (!isValue) {
    throw new InvalidInputError(
      1618597540,
      `Invalid service "${serviceName}" used. It must be "${isKey}."`
    );
  }
  return { localPath, projectPath };
}
