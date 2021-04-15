import { getLog } from '../../utils/log.js';
import { execute } from '../../utils/execute.js';
import { requestConfirmation } from '../../utils/io.js';
import { SkippedError } from '../../utils/errors';

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
  log.info(command);
  const out = await execute({ pwd, command });
  log.info(out);
  log.info(`... purge done.`);
}
