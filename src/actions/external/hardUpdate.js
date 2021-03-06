import { getInternalNodeService } from '../../utils/services.js';
import { getLog } from '../../utils/log.js';
import { executeSpawn } from '../../utils/execute.js';
import { checkProject } from '../internal/index.js';

const log = getLog('hardUpdate');

export async function hardUpdate({ pwd, params: [serviceName] = [] }) {
  await checkProject({ pwd, params: [serviceName] });
  const { name, projectPath } = await getInternalNodeService({ serviceName, pwd });
  log.info(`Hard updating node_modules for ${name} ...`);
  const command = `docker-compose run --rm -v ${projectPath}:${projectPath} dev-kit npm --prefix ${projectPath} run hardUpdate`;
  await executeSpawn({
    pwd,
    command,
    log,
  });
  log.info(`... hard update of node_modules for ${name} done.`);
}
