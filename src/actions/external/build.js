import { getInternalNodeService } from '../../utils/services.js';
import { getLog } from '../../utils/log.js';
import { executeSpawn } from '../../utils/execute.js';
import { checkProject } from '../internal/index.js';

const log = getLog('build');

export async function build({ pwd, params: [serviceName] = [] }) {
  await checkProject({ pwd, params: [serviceName] });
  const { name, projectPath } = await getInternalNodeService({ serviceName, pwd });
  log.info(`Building ${name} ...`);
  const command = `docker-compose run --rm -v ${projectPath}:/app/${serviceName} dev-kit npm --prefix /app/${serviceName} run build`;
  await executeSpawn({
    pwd,
    command,
    log,
  });
  log.info(`... build of ${name} done.`);
}
