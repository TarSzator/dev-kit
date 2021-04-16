import { getLog } from '../../../utils/log.js';
import { getServiceState } from './dockerState.js';
import { wait } from '../../../utils/promise.js';
import { EnvironmentError } from '../../../utils/errors';

const log = getLog('healthcheckService');

const MAX_RUN = 30;

export async function healthcheckService({ params: [serviceName] = [] }) {
  log.info(`Waiting for "${serviceName}" to become ready ...`);
  await healthcheck({ serviceName });
  log.info(`... "${serviceName}" is healthy.`);
}

async function healthcheck({ serviceName, run = 1 }) {
  const { isHealthy } = await getServiceState({ serviceName, reset: true });
  if (isHealthy) {
    return null;
  }
  if (run > MAX_RUN) {
    throw new EnvironmentError(1618519158, `"${serviceName}" did not became healthy`);
  }
  await wait(1000);
  return healthcheck({ serviceName, run: run + 1 });
}
