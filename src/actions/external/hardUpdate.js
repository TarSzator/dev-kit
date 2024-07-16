import { getInternalNodeService } from '../../utils/services.js';
import { getLog } from '../../utils/log.js';
import { executeSpawn } from '../../utils/execute.js';
import { checkProject } from '../internal/index.js';

const log = getLog('hardUpdate');

export async function hardUpdate({ pwd, params: [serviceName] = [], options = {} }) {
  await checkProject({ pwd, params: [serviceName] });
  const { name, projectPath } = await getInternalNodeService({ serviceName, pwd });
  log.info(`Hard updating node_modules for ${name} ...`);
  const optionString = Object.entries(options)
    .filter(([, value]) => value !== false)
    .map(([key, value]) => `--${key}${value !== true ? ` ${value}` : ''}`)
    .join(' ');
  const command = `docker compose run --rm -v ${projectPath}:${projectPath} dev-kit npm --prefix ${projectPath} run hardUpdate${
    optionString ? ` -- ${optionString}` : ''
  }`;
  await executeSpawn({
    pwd,
    command,
    log,
  });
  log.info(`... hard update of node_modules for ${name} done.`);
}
