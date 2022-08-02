import { getCertPath } from '../tools/certPaths.js';
import { getMandatoryEnvValue } from '../../../utils/env.js';
import { checkCommand, execute } from '../../../utils/execute.js';
import { getLog } from '../../../utils/log.js';
import { EnvironmentError } from '../../../utils/errors/index.js';

const log = getLog('generateCertificate');

export async function generateCertificate({ pwd }) {
  if (!(await checkCommand({ pwd, commandBin: 'openssl' }))) {
    throw new EnvironmentError(1659356205, 'You have to have openssl install to create cert');
  }
  const { certPath, certKeyPath } = getCertPath({ pwd });
  const host = getMandatoryEnvValue('HOST');
  const proxyName = getMandatoryEnvValue('PROXY_NAME');
  const command = `
    openssl req -x509 -out ${certPath} -keyout ${certKeyPath} \\
      -newkey rsa:2048 -nodes -sha256 \\
      -days 365 \\
      -subj "/CN=${host}" -extensions EXT -config <( \\
       printf "[dn]\\nCN=${host}\\n[req]\\ndistinguished_name = dn\\n[EXT]\\nsubjectAltName=DNS:${host},DNS:proxy,DNS:${proxyName},DNS:host.docker.internal\\nkeyUsage=digitalSignature\\nextendedKeyUsage=serverAuth")
  `;
  log.info(command);
  const out = await execute({ command, pwd, log });
  if (out) {
    log.info('\n', out);
  }
  return certPath;
}
