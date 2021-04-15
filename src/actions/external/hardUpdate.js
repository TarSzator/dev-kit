import { getInternalNodeService } from '../../utils/services.js';
import { getLog } from '../../utils/log.js';
import { execute } from '../../utils/execute.js';
import { checkProject } from '../internal/check/checkProject.js';

const log = getLog('hardUpdate');

export async function hardUpdate({ pwd, params: [serviceName] = [] }) {
  await checkProject({ pwd, params: [serviceName] });
  const { name, projectPath } = await getInternalNodeService({ serviceName, pwd });
  log.info(`Hard updating node_modules for ${name} ...`);
  const command = `docker-compose run --rm dev-kit -v ${projectPath}:/app/${serviceName} npm --prefix /app/${serviceName} run hardUpdate`;
  log.info(command);
  const out = await execute({
    pwd,
    command,
  });
  log.info(out);
  log.info(`... hard update of node_modules for ${name} done.`);
}
