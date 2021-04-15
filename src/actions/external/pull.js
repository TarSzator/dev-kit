import { getLog } from '../../utils/log.js';
import { getNotInternalServiceNames } from '../../utils/services.js';
import { execute } from '../../utils/execute.js';

const log = getLog('pull');

export async function pull({ pwd }) {
  log.info(`Pull current versions of not internal containers ...`);
  const serviceNames = await getNotInternalServiceNames({ pwd });
  const command = `docker-compose pull ${serviceNames.join(' ')}`;
  log.info(command);
  const out = await execute({ pwd, command });
  log.info(out);
  log.info(`... pull done.`);
}
