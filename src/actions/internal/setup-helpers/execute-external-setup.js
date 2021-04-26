import { resolve } from 'path';
import { getLog } from '../../../utils/log.js';
import { exists } from '../../../utils/fs.js';
import { isFunction } from '../../../utils/validators.js';
import { EnvironmentError } from '../../../utils/errors/index.js';

const log = getLog('executeExternalSetup');

export async function executeExternalSetup({ pwd, params, options }) {
  log.info(`... checking if an external setup script exists ...`);
  const additionalActionsPath = resolve(pwd, './actions/setup.js');
  if (!(await exists(additionalActionsPath))) {
    log.info(`... non setup script found. Skipping step ...`);
    return;
  }
  log.info(`... found setup script. Executing ...`);
  const { execute } = await import(additionalActionsPath);
  if (!isFunction(execute)) {
    throw new EnvironmentError(
      1615967093,
      `External setup script should export a function "execute" to run the additional setup required by the project`
    );
  }
  await execute({ pwd, params, options });
  log.info(`... external setup script executed ...`);
}
