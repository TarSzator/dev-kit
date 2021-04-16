import { getService } from '../../../utils/services.js';
import { getLog } from '../../../utils/log.js';
import { getServiceState } from './dockerState.js';
import { execute } from '../../../utils/execute.js';

const log = getLog('stopService');

export async function stopService({ pwd, params: [serviceName] = [] }) {
  const { name } = await getService({ serviceName, pwd });
  const { isCreated } = await getServiceState({ serviceName });
  if (!isCreated) {
    log.info(`${serviceName} already stopped`);
    return;
  }
  const stopCommand = `docker-compose stop -t 30 ${name}`;
  log.info(stopCommand);
  const stopOut = await execute({ command: stopCommand, pwd });
  log.info(stopOut);
  log.info(`${name} stopped`);
  const removeCommand = `docker-compose rm -sf ${name}`;
  log.info(removeCommand);
  const removeOut = await execute({ command: removeCommand, pwd });
  log.info(removeOut);
  log.info(`${name} removed`);
}
