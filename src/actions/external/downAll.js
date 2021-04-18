import { getLog } from '../../utils/log.js';
import { executeSpawn } from '../../utils/execute.js';

const log = getLog('downAll');

export async function downAll({ pwd }) {
  log.info(`Down all ...`);
  await executeSpawn({
    pwd,
    command: `docker-compose down`,
  });
  log.info(`... all down.`);
}
