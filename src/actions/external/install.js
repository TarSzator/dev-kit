import { resolve } from 'path';
import { getService } from '../../utils/services.js';
import { getLog } from '../../utils/log.js';
import { execute } from '../../utils/execute.js';
import InvalidInputError from '../../utils/errors/InvalidInputError.js';

const log = getLog('install');

export async function install({ pwd, params: [serviceName] = [] }) {
  const { isInternal, isNode, localPath } = await getService(serviceName);
  if (!isInternal) {
    throw new InvalidInputError(
      1615909673,
      `Install is not a valid operation for non-internal service "${serviceName}"`
    );
  }
  if (!isNode) {
    throw new InvalidInputError(
      1615909104,
      `Install is not a valid operation for non-node service "${serviceName}"`
    );
  }
  const projectPath = resolve(pwd, localPath);
  log.info(`Installing node_modules for ${serviceName} ...`);
  const installOut = await execute({
    pwd,
    command: `docker-compose run --rm dev-kit -v ${projectPath}:/app/${serviceName} npm --prefix /app/${serviceName} install`,
  });
  log.info(installOut);
  log.info(`... installing node_modules for ${serviceName} done.`);
}
