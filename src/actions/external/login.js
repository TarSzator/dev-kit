import { getLog } from '../../utils/log.js';
import { execute } from '../../utils/execute.js';
import { getService } from '../../utils/services.js';

const log = getLog('login');

export async function login({ pwd, params: [serviceName] = [] }) {
  const { name } = await getService({ serviceName, pwd });
  const command = `docker-compose exec "${name}" /bin/sh`;
  log.info(command);
  await execute({ pwd, command });
}
