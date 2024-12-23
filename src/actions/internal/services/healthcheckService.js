import { getLog } from '../../../utils/log.js';
import { getServiceState } from './dockerState.js';
import { wait } from '../../../utils/promise.js';
import { EnvironmentError } from '../../../utils/errors/index.js';

const log = getLog('healthcheckService');

export async function healthcheckService({ params: [serviceName, maxRuns] = [] }) {
  log.info(`Waiting for "${serviceName}" to become ready ...`);
  await healthcheck({ serviceName, maxRuns });
  log.info(`... "${serviceName}" is healthy.`);
}

async function healthcheck({ serviceName, maxRuns, run = 1 }) {
  const { isHealthy } = await getServiceState({ serviceName, reset: true });
  if (isHealthy) {
    return null;
  }
  if (run > maxRuns) {
    throw new EnvironmentError(1618519158, `"${serviceName}" did not became healthy`);
  }
  await wait(1000);
  return healthcheck({ serviceName, maxRuns, run: run + 1 });
}
