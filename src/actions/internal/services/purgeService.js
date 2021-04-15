import { getInternalService } from '../../../utils/services.js';
import InvalidInputError from '../../../utils/errors/InvalidInputError.js';
import { exists, getFileStats, removeFile } from '../../../utils/fs.js';
import { getLog } from '../../../utils/log.js';
import { execute } from '../../../utils/execute.js';
import { EnvironmentError, SkippedError } from '../../../utils/errors';
import { requestConfirmation } from '../../../utils/io.js';

const log = getLog('purgeService');

export async function purgeService({ pwd, params: [serviceName] = [] }) {
  const { localPath, projectPath } = await getInternalService({ serviceName, pwd });
  if (await exists(projectPath)) {
    log.info(
      `Service ${serviceName}'s path '${localPath}' does not exist and is considered purged`
    );
    return;
  }
  const { isDirectory, isSymLink, isFile } = await getFileStats(projectPath);
  if (isSymLink) {
    throw new InvalidInputError(
      1618335581,
      `Service ${serviceName}'s path '${localPath}' is a symlink. Can't be purged by this script."`
    );
  }
  if (isFile) {
    throw new InvalidInputError(
      1618335581,
      `Service ${serviceName}'s path '${localPath}' is a file. Can't be purged by this script."`
    );
  }
  if (!isDirectory) {
    throw new InvalidInputError(
      1618335694,
      `Service ${serviceName}'s path '${localPath}' is something but not a directory. Can't be purged by this script."`
    );
  }
  const commitStatus = await execute({ command: 'git status --porcelain', pwd: projectPath });
  if (commitStatus) {
    throw new EnvironmentError(
      1618336358,
      `There are not committed changes in service '${serviceName}' path '${localPath}'`
    );
  }
  const pushStatus = await execute({ command: 'git status', pwd: projectPath });
  if (pushStatus) {
    throw new EnvironmentError(
      1618336450,
      `There are not pushed commits in service '${serviceName}' path '${localPath}'`
    );
  }
  if (
    !(await requestConfirmation({
      query: `Are you sure to purged service '${serviceName}' by removing folder '${localPath}' [yN]:`,
      positiveResult: 'Y',
      defaultResult: 'N',
    }))
  ) {
    throw new SkippedError(1615877187, `User skipped purge of service '${serviceName}`);
  }
  log.info(`Purging service '${serviceName}' ...`);
  await removeFile(projectPath);
  log.info(`... service '${serviceName} purged'.`);
}
