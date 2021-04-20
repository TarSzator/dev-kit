import { getService } from '../../../utils/services.js';
import { getLog } from '../../../utils/log.js';
import { getServiceState, resetState } from './dockerState.js';
import { executeSpawn } from '../../../utils/execute.js';

const log = getLog('stopService');

export async function stopService({ pwd, params: [serviceName] = [] }) {
  const { name } = await getService({ serviceName, pwd });
  const { isCreated } = await getServiceState({ serviceName });
  if (!isCreated) {
    log.info(`${serviceName} already stopped`);
    return;
  }
  const stopCommand = `docker-compose stop -t 30 ${name}`;
  await executeSpawn({ command: stopCommand, pwd, log });
  log.info(`${name} stopped`);
  const removeCommand = `docker-compose rm -sf ${name}`;
  await executeSpawn({ command: removeCommand, pwd, log });
  log.info(`${name} removed`);
  resetState();
}
