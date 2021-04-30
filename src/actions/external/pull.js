import { getLog } from '../../utils/log.js';
import { getNotInternalServiceNames } from '../../utils/services.js';
import { executeSpawn } from '../../utils/execute.js';

const log = getLog('pull');

export async function pull({ pwd }) {
  log.info(`Pull current versions of not internal containers ...`);
  const serviceNames = await getNotInternalServiceNames({ pwd });
  const command = `docker-compose pull ${serviceNames.join(' ')}`;
  await executeSpawn({ pwd, command, log });
  log.info(`... pull done.`);
}
