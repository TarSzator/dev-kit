import { getLog } from '../../utils/log.js';
import { executeSpawn } from '../../utils/execute.js';
import { getService } from '../../utils/services.js';

const log = getLog('exec');

export async function exec({ pwd, params: [serviceName, execCommand] = [] }) {
  const { name } = await getService({ serviceName, pwd });
  const command = `docker-compose exec ${name} ${execCommand}`;
  await executeSpawn({ pwd, command, log });
}
