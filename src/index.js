import { getLog } from './utils/log.js';
import { initEnv } from './utils/env.js';
import { getServices } from './utils/docker-compose.js';

const log = getLog('main');

export async function processAction() {
  try {
    await initEnv();
    const services = await getServices();
    log.info({ pwd: process.cwd(), env: process.env, services });
    return 0;
  } catch (error) {
    log.error('Action execution failed!', error);
    return 1;
  }
}
