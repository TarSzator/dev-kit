import { getService } from '../../utils/services.js';
import { getLog } from '../../utils/log.js';
import { executeSpawn } from '../../utils/execute.js';
import { runService } from '../internal/index.js';
import { getAllServiceDependencies } from '../internal/services/getAllServiceDependencies.js';
import { runForDependencies } from '../internal/tools/runForDependencies.js';
import { isArray, isArrayOf, isNonEmptyString } from '../../utils/validators.js';
import { InvalidInputError } from '../../utils/errors/index.js';

const log = getLog('run');

export async function run({ pwd, params: [serviceName, runCommand] = [], options: { env } = {} }) {
  const { name } = await getService({ serviceName, pwd });
  const dependencies = await getAllServiceDependencies({ pwd, params: [name] });
  await runForDependencies({
    dependencies,
    runner: async (s) => runService({ pwd, params: [s] }),
  });
  const envOptions = getDockerEnvOption(env);
  const command = `docker-compose run --rm ${envOptions} ${name} ${runCommand}`;
  await executeSpawn({
    pwd,
    command,
    log,
  });
}

function getDockerEnvOption(env) {
  if (!env) {
    return '';
  }
  const envOptions = isArray(env) ? [...env] : [env];
  if (!isArrayOf(envOptions, isNonEmptyString)) {
    throw new InvalidInputError(1659205367, 'Env options must be non-empty strings');
  }
  const envVars = envOptions.reduce((m, option) => {
    const parts = option.split('=');
    if (!isArrayOf(parts, isNonEmptyString) || parts.length !== 2) {
      throw new InvalidInputError(
        1659205555,
        'Each env option must be a key-value pair separated by a = operator'
      );
    }
    const [k, v] = parts;
    // eslint-disable-next-line no-param-reassign
    m[k] = v;
    return m;
  }, {});
  log.info('Add env vars to service run', envVars);
  return Object.entries(envVars).reduce((m, [k, v]) => {
    const o = `-e ${k}=${v}`;
    return m ? `${m} ${o}` : o;
  }, '');
}
