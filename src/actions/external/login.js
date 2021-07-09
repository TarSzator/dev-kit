import { getLog } from '../../utils/log.js';
import { executeSpawn } from '../../utils/execute.js';
import { getService } from '../../utils/services.js';

const log = getLog('login');
const ALLOWED_SHELLS = ['sh', 'bash', 'zsh'];

export async function login({ pwd, params: [serviceName, shell] = [] }) {
  const { name } = await getService({ serviceName, pwd });
  const targetShell = ALLOWED_SHELLS.includes(shell) ? shell : 'bash';
  const command = `docker-compose exec ${name} /bin/${targetShell}`;
  await executeSpawn({ pwd, command, log });
}
