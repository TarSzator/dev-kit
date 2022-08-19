import { getInternalNodeService } from '../../utils/services.js';
import { getLog } from '../../utils/log.js';
import { executeSpawn } from '../../utils/execute.js';
import { isTruthy } from '../../utils/validators.js';

const log = getLog('install');

export async function install({
  pwd,
  params: [serviceName] = [],
  options: { omitPeer = false, omitDev = false, omitOptional = false } = {},
  main = false,
}) {
  const { projectPath } = await getInternalNodeService({ serviceName, pwd });
  const options = !main ? [] : process.argv.slice(process.argv.indexOf(serviceName) + 1);
  const packagesList = options.length ? ` ${options.join(' ')}` : '';
  log.info(
    `Installing ${
      packagesList ? `packages ${packagesList}` : 'node_modules'
    } for ${serviceName} ...`
  );
  const installOptionsString = getInstallOptions({
    omitPeer: isTruthy(omitPeer),
    omitDev: isTruthy(omitDev),
    omitOptional: isTruthy(omitOptional),
  });
  await executeSpawn({
    pwd,
    command: `docker-compose run --rm -v ${projectPath}:${projectPath} dev-kit npm --prefix ${projectPath} install${installOptionsString}${packagesList}`,
    log,
  });
  log.info(`... installing node_modules for ${serviceName} done.`);
}

function getInstallOptions({ omitPeer = false, omitDev = false, omitOptional = false }) {
  const options = [];
  if (omitPeer) {
    options.push('--omit peer');
  }
  if (omitDev) {
    options.push('--omit dev');
  }
  if (omitOptional) {
    options.push('--omit optional');
  }
  if (!options.length) return '';
  return ` ${options.join(' ')}`;
}
