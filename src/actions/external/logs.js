import { getLog } from '../../utils/log.js';
import { executeSpawn } from '../../utils/execute.js';
import { getService } from '../../utils/services.js';

const log = getLog('logs');

export async function logs({ pwd, params: [serviceName] = [] }) {
  const { name } = await getService({ serviceName, pwd });
  const command = `docker-compose logs ${name}`;
  await executeSpawn({ pwd, command, log });
}
