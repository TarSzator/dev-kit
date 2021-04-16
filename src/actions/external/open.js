import { tail } from './tail.js';
import { up } from './up.js';
import { getInternalNodeService } from '../../utils/services.js';
import { execute } from '../../utils/execute.js';
import InvalidInputError from '../../utils/errors/InvalidInputError.js';

export async function open({ pwd, params: [serviceName] }) {
  const { name, openUrl } = await getInternalNodeService({ serviceName, pwd });
  if (!openUrl) {
    throw new InvalidInputError(1618564636, `No open url defined for service "${name}"`);
  }
  await up({ pwd, params: [name] });
  await execute({ pwd, command: `open "${openUrl}"` });
  await tail({ pwd, params: [name] });
}
