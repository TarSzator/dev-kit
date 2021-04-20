import { stopService, runServiceWithDependencies } from '../internal/index.js';
import { tail } from './tail.js';

export async function restart({ pwd, params: [serviceName] }) {
  await stopService({ pwd, params: [serviceName] });
  await runServiceWithDependencies({ pwd, params: [serviceName, true] });
  await tail({ pwd, params: [serviceName] });
}
