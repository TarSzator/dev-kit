import { getLog } from '../../utils/log.js';
import { execute } from '../../utils/execute.js';
import { getService } from '../../utils/services.js';

const log = getLog('tail');

export async function tail({ pwd, params: [serviceName] = [] }) {
  const { name } = await getService({ serviceName, pwd });
  const command = `docker-compose logs -f "${name}"`;
  log.info(command);
  await execute({ pwd, command });
}
