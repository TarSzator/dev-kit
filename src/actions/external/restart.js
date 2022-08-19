import { stopService, runServiceWithDependencies } from '../internal/index.js';
import { tail } from './tail.js';
import { isTruthy } from '../../utils/validators.js';

export async function restart({ pwd, params: [serviceName], options: { skipTail = false } = {} }) {
  await stopService({ pwd, params: [serviceName] });
  await runServiceWithDependencies({ pwd, params: [serviceName, true] });
  if (!isTruthy(skipTail)) {
    await tail({ pwd, params: [serviceName] });
  }
}
