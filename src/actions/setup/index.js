import { getLog } from '../../utils/log.js';
import { requestConfirmation } from '../../utils/io.js';
import { SkippedError } from '../../utils/errors/index.js';
import { getDockerComposePath } from '../../utils/docker-compose.js';
import { getEnvPath } from '../../utils/env.js';
import { prepareDockerCompose } from './prepareDockerCompose.js';
import { prepareEnv } from './prepareEnv.js';
import { prepareCertFolder } from './prepareCertFolder.js';
import { prepareConfigFolder } from './prepareConfigFolder.js';
import { prepareGitIgnore } from './prepareGitIgnore.js';
import { prepareRun } from './prepareRun.js';

const log = getLog('setup');

export async function setup() {
  try {
    log.info(`Starting setup ...`);
    const pwd = process.cwd();
    if (
      !(await requestConfirmation({
        query: `Setting up dev kit in folder: "${pwd}"? [Yn]`,
      }))
    ) {
      throw new SkippedError(`Wrong folder`);
    }
    const envPath = getEnvPath({ path: pwd });
    await prepareEnv({ filePath: envPath });
    const composePath = getDockerComposePath({ path: pwd });
    await prepareDockerCompose({ filePath: composePath });
    await prepareGitIgnore({ pwd });
    log.info(`... setup done`);
    return 0;
  } catch (error) {
    if (error instanceof SkippedError) {
      log.notice(`Skipped due to: ${error.message}`);
      return 0;
    }
    log.error(`... setup failed`, error);
    return 1;
  }
}
