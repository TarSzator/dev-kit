import { getLog } from '../../../utils/log.js';
import { getCertificateState, CERT_STATE } from './getCertificateState.js';
import { EnvironmentError, SkippedError } from '../../../utils/errors';
import { requestConfirmation } from '../../../utils/io.js';
import { unregisterCertificate } from './unregisterCertificate.js';
import { removeCertificate } from './removeCertificate.js';

const log = getLog('purgeCertificate');

export async function purgeCertificate({ pwd }) {
  const state = await getCertificateState({ pwd });
  if (state === CERT_STATE.NONE) {
    log.info(`Certificate does not exists. Assuming it was also not registered with the system.`);
    return;
  }
  if (state === CERT_STATE.PARTIAL) {
    throw new EnvironmentError(1615877050, `Only partial cert found. Please clean up manually.`);
  }
  log.info(`Un-registering and removing certificate ...`);
  if (
    !(await requestConfirmation({
      query:
        'To un-register the certificate with you system we need sudo rights. For that we will request your password. Please acknowledge? [Yn]:',
    }))
  ) {
    throw new SkippedError(1615877187, `No acknowledgment of root-password need`);
  }
  if (await unregisterCertificate({ pwd })) {
    log.info(`... certificate un-registered from system. Removing ...`);
  } else {
    log.info(`... certificate was not registered at system. Removing ...`);
  }
  await removeCertificate({ pwd });
  log.info(`... certificate un-registered and removed.`);
}
