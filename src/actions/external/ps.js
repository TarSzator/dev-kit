import { getLog } from '../../utils/log.js';
import { execute } from '../../utils/execute.js';

const log = getLog('ps');

export async function ps({ pwd }) {
  const command = `docker-compose ps`;
  log.info(command);
  const out = await execute({ pwd, command });
  log.info(out);
}
