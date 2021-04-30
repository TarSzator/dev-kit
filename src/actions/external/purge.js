import { getLog } from '../../utils/log.js';
import { executeSpawn } from '../../utils/execute.js';
import { requestConfirmation } from '../../utils/io.js';
import { SkippedError } from '../../utils/errors/index.js';

const log = getLog('purge');

export async function purge({ pwd }) {
  if (
    !(await requestConfirmation({
      query: 'Do you really want to remove everything docker related to this project? [yN]:',
      defaultResult: 'N',
      positiveResult: 'Y',
    }))
  ) {
    throw new SkippedError(1618473561, `User skipped purge process`);
  }
  log.info(`Purging docker for this project ...`);
  const command = 'docker-compose down -v --rmi all';
  await executeSpawn({ pwd, command, log });
  log.info(`... purge done.`);
}
