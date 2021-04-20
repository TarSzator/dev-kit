import { executeSpawn } from '../../../utils/execute.js';
import { getLog } from '../../../utils/log.js';

const log = getLog('unlinkHomeBin');

export async function unlinkHomeBin({ pwd }) {
  await executeSpawn({
    pwd,
    command: `npm unlink -g`,
    log,
  });
  log.notice(`Unlinked devKit. Shortcut can no longer be used`);
}
