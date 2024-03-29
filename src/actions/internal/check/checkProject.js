import { resolve } from 'path';
import { createFolder, exists } from '../../../utils/fs.js';
import { getInternalService } from '../../../utils/services.js';
import { getLog } from '../../../utils/log.js';
import { requestConfirmation } from '../../../utils/io.js';
import { EnvironmentError, SkippedError } from '../../../utils/errors/index.js';
import { executeSpawn } from '../../../utils/execute.js';
import { install } from '../../external/install.js';
import { checkCertificate } from '../certificate/checkCertificate.js';
import { isTruthy } from '../../../utils/validators.js';

const log = getLog('checkProject');

export async function checkProject({
  pwd,
  params: [serviceName] = [],
  options: { skipInstall = false } = {},
}) {
  const { repo, localPath, projectPath, isNode } = await getInternalService({ serviceName, pwd });
  const path = isNode ? resolve(projectPath, 'package.json') : projectPath;
  if (await exists(path)) {
    await checkCertificate({ pwd });
    return;
  }
  log.notice(`Project for service '${serviceName}' was not found in path '${projectPath}'`);
  if (
    !(await requestConfirmation({
      query: 'Do you want to clone it to this path? [yN]',
      positiveResult: 'Y',
      defaultResult: 'N',
    }))
  ) {
    throw new SkippedError(
      1615902053,
      `Service "${serviceName}" clone to "${projectPath}" canceled by user`
    );
  }
  log.info(`Setting up repository ${repo} to ${localPath} for service ${serviceName} ...`);
  await createFolder(projectPath);
  await executeSpawn({ command: `git clone ${repo} ${localPath}`, pwd, log });
  log.info(`Cloned repository ${repo} to ${localPath} for service ${serviceName}`);
  if (isNode && !isTruthy(skipInstall)) {
    await install({ pwd, params: [serviceName] });
  }
  if (!(await exists(path))) {
    throw new EnvironmentError(
      1615903482,
      `After checkout and install of service "${serviceName}" the project still does not have a package.json file`
    );
  }
  await checkCertificate({ pwd });
}
