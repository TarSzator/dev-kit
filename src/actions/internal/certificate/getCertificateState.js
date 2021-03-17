import { getCertPath } from '../tools/certPaths.js';
import { exists } from '../../../utils/fs.js';
import { getLog } from '../../../utils/log.js';

const log = getLog('getCertificateState');

export const CERT_STATE = {
  ALL: 'ALL',
  PARTIAL: 'PARTIAL',
  NONE: 'NONE',
};

export async function getCertificateState({ pwd }) {
  const { certPath, certKeyPath } = getCertPath({ pwd });
  const crtExists = await exists(certPath);
  const keyExists = await exists(certKeyPath);
  if (crtExists && keyExists) {
    return CERT_STATE.ALL;
  }
  if (!crtExists && !keyExists) {
    log.warn('No certificate found');
    return CERT_STATE.NONE;
  }
  if (!crtExists) {
    log.error(`Key already exists but crt is missing`);
    return CERT_STATE.PARTIAL;
  }
  log.error(`Crt already exists but key is missing`);
  return CERT_STATE.PARTIAL;
}
