import { execute } from '../../../utils/execute.js';
import { getLog } from '../../../utils/log.js';

const log = getLog('linkHomeBin');

export async function linkHomeBin({ pwd }) {
  const linkOut = await execute({
    pwd,
    command: `npm link`,
  });
  log.info(linkOut);
  log.notice(`When a new version of node is installed you might need to relink the bin.`);
}
