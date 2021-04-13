import { resolve } from 'path';
import { getLog } from '../../../utils/log.js';
import { exists } from '../../../utils/fs.js';
import { isFunction } from '../../../utils/validators.js';
import { EnvironmentError } from '../../../utils/errors';

const log = getLog('executeExternalPurge');

export async function executeExternalPurge({ pwd, params, options }) {
  log.info(`... checking if an external purge script exists ...`);
  const additionalActionsPath = resolve(pwd, './actions/purge.js');
  if (!(await exists(additionalActionsPath))) {
    log.info(`... non found. Skipping step ...`);
    return;
  }
  log.info(`... found script. Executing ...`);
  const { execute } = await import(additionalActionsPath);
  if (!isFunction(execute)) {
    throw new EnvironmentError(
      1615967093,
      `External purge script should export a function "execute" to run the additional setup required by the project`
    );
  }
  await execute({ pwd, params, options });
  log.info(`... external purge script executed ...`);
}
