import { basename } from 'path';
import { getLog } from './utils/log.js';
import { initEnv } from './utils/env.js';
import { getCallInput } from './utils/options.js';
import InvalidInputError from './utils/errors/InvalidInputError.js';
import { printHelp } from './utils/io.js';
import { getActions } from './utils/actions.js';
import { getPwd } from './utils/pwd.js';

const log = getLog('main');

export async function processAction() {
  let actions = {};
  try {
    const pwd = await getPwd();
    const projectName = basename(pwd);
    await initEnv({ pwd });
    const { action, params, options } = getCallInput();
    log.info(`Execution action "${action}" of project "${projectName}"`);
    actions = await getActions({ pwd });
    if (action === 'help') {
      printHelp(actions);
      return 0;
    }
    const { exec } = actions[action] || {};
    if (!exec) {
      throw new InvalidInputError(`Unknown action "${action}"`);
    }
    await exec({ pwd, params, options });
    return 0;
  } catch (error) {
    if (error instanceof InvalidInputError) {
      log.error(`Invalid input: ${error.message}`);
      printHelp(actions);
    } else {
      log.error('Action execution failed!', error);
    }
    return 1;
  }
}
