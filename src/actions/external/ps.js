import { getLog } from '../../utils/log.js';
import { dockerPs } from '../internal/services/dockerPs.js';

const log = getLog('ps');

export async function ps({ pwd }) {
  const out = await dockerPs({ pwd });
  log.info(out);
}
