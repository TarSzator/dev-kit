import { getLog } from '../../utils/log.js';
import { purgeCertificate, purgeService, executeExternalPurge } from '../internal/index.js';
import { getInternalServiceNames } from '../../utils/services.js';
import { waterfall } from '../../utils/promise.js';
import { downAll } from './downAll.js';
import { execute } from '../../utils/execute.js';

const log = getLog('terminate');

export async function terminate({ pwd, params, options }) {
  log.info(`Uninstalls local development environment ...`);
  await downAll({ pwd });
  log.info(`... environment shut down ...`);
  await purgeCertificate({ pwd });
  log.info(`... certificate purged ...`);
  const servicesToPurge = await getInternalServiceNames({ pwd });
  await waterfall(
    servicesToPurge.map((serviceName) => async () => {
      await purgeService({ pwd, params: [serviceName] });
      log.info(`... ${serviceName} service purged ...`);
    })
  );
  const downOut = execute({
    command: 'docker-compose down --rmi all -v',
    pwd,
  });
  log.info(downOut);
  log.info('... removed docker images and volumes ...');
  await executeExternalPurge({ pwd, params, options });
  log.info(`... initial setup reverted.`);
}
