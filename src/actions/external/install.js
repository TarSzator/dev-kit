import { getInternalNodeService } from '../../utils/services.js';
import { getLog } from '../../utils/log.js';
import { executeSpawn } from '../../utils/execute.js';

const log = getLog('install');

export async function install({ pwd, params: [serviceName] = [] }) {
  const { projectPath } = await getInternalNodeService({ serviceName, pwd });
  log.info(`Installing node_modules for ${serviceName} ...`);
  await executeSpawn({
    pwd,
    command: `docker compose run --rm -v ${projectPath}:${projectPath} dev-kit npm --prefix ${projectPath} install`,
    log,
  });
  log.info(`... installing node_modules for ${serviceName} done.`);
}
