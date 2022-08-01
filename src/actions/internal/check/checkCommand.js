import { execute } from '../../../utils/execute.js';
import { isTruthy } from '../../../utils/validators.js';

export async function checkCommand({ pwd, commandBin }) {
  const command = `sudo  which ${commandBin} > /dev/null && echo 'true' || echo 'false'`;
  const checkResult = await execute({ command, pwd });
  return isTruthy(checkResult);
}
