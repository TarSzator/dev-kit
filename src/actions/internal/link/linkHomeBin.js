import { executeSpawn } from '../../../utils/execute.js';
import { getLog } from '../../../utils/log.js';

const log = getLog('linkHomeBin');

export async function linkHomeBin({ pwd }) {
  await executeSpawn({
    pwd,
    command: `npm link`,
    log,
  });
  log.notice(`When a new version of node is installed you might need to relink the bin.`);
}
