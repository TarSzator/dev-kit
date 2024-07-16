import { getInternalNodeService } from '../../utils/services.js';
import { getLog } from '../../utils/log.js';
import { executeSpawn } from '../../utils/execute.js';
import { checkProject } from '../internal/index.js';
import { determineAbsoluteFilePath } from '../../utils/path.js';

const log = getLog('unitTest');

export async function unitTest({ pwd, params: [serviceName, file] = [] }) {
  await checkProject({ pwd, params: [serviceName] });
  const { name, projectPath } = await getInternalNodeService({ serviceName, pwd });
  log.info(`Run unit tests for ${name} ...`);
  const command = `docker compose run --rm ${name} npm --prefix ${projectPath} run test${
    !file ? '' : ` -- ${determineAbsoluteFilePath(projectPath, file)}`
  }`;
  await executeSpawn({
    pwd,
    command,
    log,
  });
  log.info(`... unit tests for ${name} done.`);
}
