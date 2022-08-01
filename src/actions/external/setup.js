import { getLog } from '../../utils/log.js';
import {
  prepareCertificate,
  checkInstall,
  linkHomeBin,
  executeExternalSetup,
  checkProject,
} from '../internal/index.js';
import { getInternalServiceNames } from '../../utils/services.js';
import { waterfall } from '../../utils/promise.js';

const log = getLog('setup');

export async function setup({ pwd, params, options }) {
  log.info(`Check and setup local development environment ...`);
  await prepareCertificate({ pwd });
  log.info(`... certificate done ...`);
  const servicesToSetup = await getInternalServiceNames({ pwd });
  await waterfall(
    servicesToSetup.map((serviceName) => async () => {
      log.info(`... checking service cloning "${serviceName}" ...`);
      await checkProject({ pwd, params: [serviceName], options: { skipInstall: true } });
      log.info(`... ${serviceName} service cloned ...`);
    })
  );
  await waterfall(
    servicesToSetup.map((serviceName) => async () => {
      log.info(`... checking service "${serviceName}" ...`);
      await checkInstall({ pwd, params: [serviceName] });
      log.info(`... ${serviceName} service checked ...`);
    })
  );
  await linkHomeBin({ pwd });
  log.info('... link project. Bin is now available globally ...');
  await executeExternalSetup({ pwd, params, options });
  log.info(`... initial setup done.`);
}
