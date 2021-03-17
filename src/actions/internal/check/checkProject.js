import { resolve } from 'path';
import { createFolder, exists } from '../../../utils/fs.js';
import { getService } from '../../../utils/services.js';
import { getLog } from '../../../utils/log.js';
import { requestConfirmation } from '../../../utils/io.js';
import { EnvironmentError, SkippedError } from '../../../utils/errors';
import { execute } from '../../../utils/execute.js';
import { install } from '../../external/install.js';
import { checkCertificate } from '../certificate/checkCertificate.js';
import InvalidInputError from '../../../utils/errors/InvalidInputError.js';

const log = getLog('checkProject');

export async function checkProject({ pwd, params: [serviceName] = [] }) {
  const { isInternal, repo, localPath } = await getService(serviceName);
  if (!isInternal) {
    throw new InvalidInputError(
      1615909578,
      `Internal check project is not a valid operation for non-internal service "${serviceName}"`
    );
  }
  const projectPath = resolve(pwd, localPath);
  if (await exists(resolve(projectPath, 'package.json'))) {
    await checkCertificate({ pwd });
    return;
  }
  log.notice(`Project for service '${serviceName}' was not found in path '${projectPath}'`);
  if (!(await requestConfirmation({ query: 'Do you want to clone it to this path? [yN]' }))) {
    throw new SkippedError(
      1615902053,
      `Service "${serviceName}" clone to "${projectPath}" canceled by user`
    );
  }
  log.info(`Setting up repository ${repo} to ${localPath} for service ${serviceName} ...`);
  await createFolder(projectPath);
  const cloneOut = await execute({ command: `git clone ${repo} ${localPath}`, pwd });
  log.info(cloneOut);
  log.info(`Cloned repository ${repo} to ${localPath} for service ${serviceName}`);
  await install({ pwd, params: [serviceName] });
  if (!(await exists(resolve(projectPath, 'package.json')))) {
    throw new EnvironmentError(
      1615903482,
      `After checkout and install of service "${serviceName}" the project still does not have a package.json file`
    );
  }
  await checkCertificate({ pwd });
}
