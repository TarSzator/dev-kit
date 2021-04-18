import { getLog } from '../../utils/log.js';
import { dockerPs } from '../internal/index.js';

const log = getLog('ps');

export async function ps({ pwd }) {
  const out = await dockerPs({ pwd });
  log.info('\n', out);
}
