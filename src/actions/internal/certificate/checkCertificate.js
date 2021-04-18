import { getCertificateState, CERT_STATE } from './getCertificateState.js';
import { EnvironmentError } from '../../../utils/errors/index.js';

export async function checkCertificate({ pwd }) {
  const state = await getCertificateState({ pwd });
  if (state !== CERT_STATE.ALL) {
    throw new EnvironmentError(1615903365, 'Did not find certificate. Please run "setup"');
  }
}
