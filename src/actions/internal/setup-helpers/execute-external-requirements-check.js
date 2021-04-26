import { resolve } from 'path';
import { exists } from '../../../utils/fs.js';
import { isFunction } from '../../../utils/validators.js';
import { EnvironmentError } from '../../../utils/errors/index.js';

export async function executeExternalRequirementsCheck({ pwd, params, options }) {
  const additionalActionsPath = resolve(pwd, './actions/requirements-check.js');
  if (!(await exists(additionalActionsPath))) {
    return;
  }
  const { execute } = await import(additionalActionsPath);
  if (!isFunction(execute)) {
    throw new EnvironmentError(
      1615967093,
      `External requirements check script should export a function "execute" to run the additional setup required by the project`
    );
  }
  await execute({ pwd, params, options });
}
