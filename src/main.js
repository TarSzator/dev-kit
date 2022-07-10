import { basename } from 'path';
import { getLog } from './utils/log.js';
import { initEnv } from './utils/env.js';
import { getCallInput } from './utils/options.js';
import { InvalidInputError } from './utils/errors/index.js';
import { printHelp } from './utils/io.js';
import { getActions } from './utils/actions.js';
import { getPwd } from './utils/pwd.js';
import { executeExternalRequirementsCheck } from './actions/internal/index.js';

const log = getLog('main');

export async function processAction() {
  let actions = {};
  try {
    const pwd = await getPwd();
    const projectName = basename(pwd);
    await initEnv({ pwd });
    const { action, params, options } = getCallInput();
    log.info(`Execution action "${action}" of project "${projectName}"`, options);
    actions = await getActions({ pwd });
    if (action === 'help') {
      printHelp(actions);
      return 0;
    }
    const { exec } = actions[action] || {};
    if (!exec) {
      throw new InvalidInputError(1621500260, `Unknown action "${action}"`);
    }
    await executeExternalRequirementsCheck({ pwd, params, options });
    await exec({ pwd, params, options, main: true });
    return 0;
  } catch (error) {
    if (error instanceof InvalidInputError) {
      const { message, id } = error;
      log.error(`Invalid input: ${message} [${id}]`);
      printHelp(actions);
    } else {
      log.error('Action execution failed!', error);
    }
    return 1;
  }
}
