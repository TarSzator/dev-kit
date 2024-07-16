import { getLog } from '../../utils/log.js';
import {
  purgeCertificate,
  purgeService,
  executeExternalPurge,
  unlinkHomeBin,
} from '../internal/index.js';
import { getInternalServiceNames } from '../../utils/services.js';
import { waterfall } from '../../utils/promise.js';
import { downAll } from './downAll.js';
import { executeSpawn } from '../../utils/execute.js';
import { SkippedError } from '../../utils/errors/index.js';

const log = getLog('terminate');

export async function terminate({ pwd, params, options }) {
  log.info(`Uninstalls local development environment ...`);
  await downAll({ pwd });
  log.info(`... environment shut down ...`);
  await purgeCertificate({ pwd });
  log.info(`... certificate purged ...`);
  await executeSpawn({
    command: 'docker compose down --rmi all -v',
    pwd,
    log,
  });
  log.info('... removed docker images and volumes ...');
  const servicesToPurge = await getInternalServiceNames({ pwd });
  await waterfall(
    servicesToPurge.map((serviceName) => async () => {
      await purgeService({ pwd, params: [serviceName] }).catch((error) => {
        if (error instanceof SkippedError) {
          return;
        }
        throw error;
      });
      log.info(`... ${serviceName} service purged ...`);
    })
  );
  await executeExternalPurge({ pwd, params, options });
  await unlinkHomeBin({ pwd });
  log.info(`... initial setup reverted.`);
}
