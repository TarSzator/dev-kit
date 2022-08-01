import { getLog } from '../../../utils/log.js';
import { getCertificateState, CERT_STATE } from './getCertificateState.js';
import { EnvironmentError, SkippedError } from '../../../utils/errors/index.js';
import { requestConfirmation } from '../../../utils/io.js';
import { generateCertificate } from './generateCertificate.js';
import { registerCertificate } from './registerCertificate.js';

const log = getLog('prepareCertificate');

export async function prepareCertificate({ pwd }) {
  const state = await getCertificateState({ pwd });
  if (state === CERT_STATE.ALL) {
    log.info(
      `Certificate already exists. Assuming it is also registered and accepted by the system.`
    );
    return;
  }
  if (state === CERT_STATE.PARTIAL) {
    throw new EnvironmentError(
      1615877050,
      `Only partial cert found. Please clean up and run again`
    );
  }
  log.info(`Generating and registering certificate ...`);
  if (
    !(await requestConfirmation({
      query:
        'To register the certificate with you system we need sudo rights. For that we will request your password. Please acknowledge? [Yn]:',
    }))
  ) {
    throw new SkippedError(1615877187, `No acknowledgment of root-password need`);
  }
  const certPath = await generateCertificate({ pwd });
  log.info(`... certificate generated. Registering it with the system ...`);
  if (await registerCertificate({ pwd })) {
    log.info(`... certificate generated and registered.`);
  } else {
    log.info(
      `... certificate generated but not registered with the system. Please do this yourself "${certPath}"`
    );
  }
}
