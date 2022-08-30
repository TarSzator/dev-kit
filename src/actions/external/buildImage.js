import { getInternalService } from '../../utils/services.js';
import { getLog } from '../../utils/log.js';
import { executeSpawn } from '../../utils/execute.js';
import { checkProject } from '../internal/index.js';
import { hasOwnProperty, isEmpty } from '../../utils/validators.js';

const log = getLog('buildImage');

export async function buildImage({ pwd, params: [serviceName] = [], options }) {
  await checkProject({ pwd, params: [serviceName] });
  const { name } = await getInternalService({ serviceName, pwd });
  log.info(`Building docker image ${name} ...`);
  if (!isEmpty(options)) {
    log.notice(`... use following options ...\n${JSON.stringify(options, null, '  ')}`);
  }
  let command = `docker-compose build`;
  if (hasOwnProperty(options, 'noCache')) {
    command += ` --no-cache`;
  }
  if (hasOwnProperty(options, 'verbose')) {
    command += ` --progress plain`;
  }
  command += ` ${name}`;
  await executeSpawn({
    pwd,
    command,
    log,
  });
  log.info(`... build of ${name} docker image done.`);
}
