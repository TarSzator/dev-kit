import { getLog } from '../../utils/log.js';
import { execute } from '../../utils/execute.js';

const log = getLog('downAll');

export async function downAll({ pwd }) {
  log.info(`Down all ...`);
  const out = await execute({
    pwd,
    command: `docker-compose down`,
  });
  log.info(out);
  log.info(`... all down.`);
}
