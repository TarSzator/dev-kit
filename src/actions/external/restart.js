import { stopService } from '../internal/services/stopService.js';
import { runService } from '../internal/services/runService.js';
import { tail } from './tail.js';

export async function restart({ pwd, params: [serviceName] }) {
  await stopService({ pwd, params: [serviceName] });
  await runService({ pwd, params: [serviceName, true] });
  await tail({ pwd, params: [serviceName] });
}
