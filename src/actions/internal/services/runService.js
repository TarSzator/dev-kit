import { getService } from '../../../utils/services.js';
import { getLog } from '../../../utils/log.js';
import { getServiceState } from './dockerState.js';
import { stopService } from './stopService.js';
import { executeSpawn } from '../../../utils/execute.js';
import { healthcheckService } from './healthcheckService.js';

const log = getLog('runService');

export async function runService({ pwd, params: [serviceName, skipHealthcheck = false] = [] }) {
  const { name, hasHealthcheck } = await getService({ serviceName, pwd });
  const { isCreated, isUp, isHealthy } = await getServiceState({ serviceName });
  if (isHealthy) {
    log.info(`${name} is already running`);
    return;
  }
  if (isUp) {
    log.info(`${name} is already running but not healthy yet`);
    return;
  }
  if (isCreated) {
    log.notice(`${name} is in an invalid state stopping it ...`);
    await stopService({ pwd, params: [name] });
  }
  const command = `docker-compose up -d ${name}`;
  await executeSpawn({ command, pwd, log });
  if (hasHealthcheck && !skipHealthcheck) {
    await healthcheckService({ pwd, params: [name] });
  }
}
