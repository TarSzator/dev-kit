import { getLog } from '../../utils/log.js';
import { prepareCertificate } from '../internal/index.js';
import { getInternalServiceNames } from '../../utils/services.js';
import { waterfall } from '../../utils/promise.js';
import { checkInstall } from '../internal/check/checkInstall.js';
import { linkHomeBin } from '../internal/link/linkHomeBin.js';
import { executeExternalSetup } from '../internal/setup-helpers/execute-external-setup.js';

const log = getLog('setup');

export async function setup({ pwd, params, options }) {
  log.info(`Check and setup local development environment ...`);
  await prepareCertificate({ pwd });
  log.info(`... certificate done ...`);
  const servicesToSetup = await getInternalServiceNames();
  await waterfall(
    servicesToSetup.map((serviceName) => async () => {
      log.info(`... checking service ${serviceName} ...`);
      await checkInstall({ pwd, params: [serviceName] });
      log.info(`... ${serviceName} service ...`);
    })
  );
  await linkHomeBin({ pwd });
  log.info('... link project. Bin is now available globally ...');
  await executeExternalSetup({ pwd, params, options });
  log.info(`... initial setup done.`);
}
