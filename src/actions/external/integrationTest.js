import { getInternalNodeService } from '../../utils/services.js';
import { getLog } from '../../utils/log.js';
import { executeSpawn } from '../../utils/execute.js';
import { checkProject } from '../internal/index.js';
import { up } from './up.js';
import { determineAbsoluteFilePath } from '../../utils/path.js';

const log = getLog('integrationTest');

export async function integrationTest({ pwd, params: [serviceName, file] = [] }) {
  await checkProject({ pwd, params: [serviceName] });
  const { name, projectPath } = await getInternalNodeService({ serviceName, pwd });
  log.info(`Run integration tests for ${name} ...`);
  await up({ pwd, params: [serviceName] });
  const command = `docker-compose run --rm -v ${projectPath}:${projectPath} dev-kit npm --prefix ${projectPath} run test:integration${
    !file ? '' : ` -- ${determineAbsoluteFilePath(projectPath, file)}`
  }`;
  await executeSpawn({
    pwd,
    command,
    log,
  });
  log.info(`... unit integration tests for ${name} done.`);
}
