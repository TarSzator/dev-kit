import { getCertPath } from '../tools/certPaths.js';
import { getMandatoryEnvValue } from '../../../utils/env.js';
import { execute } from '../../../utils/execute.js';
import { getLog } from '../../../utils/log.js';

const log = getLog('generateCertificate');

export async function generateCertificate({ pwd }) {
  const { certPath, certKeyPath } = getCertPath({ pwd });
  const host = getMandatoryEnvValue('HOST');
  const proxyName = getMandatoryEnvValue('PROXY_NAME');
  const command = `
    openssl req -x509 -out ${certPath} -keyout ${certKeyPath} \\
      -newkey rsa:2048 -nodes -sha256 \\
      -days 365 \\
      -subj "/CN=${host}" -extensions EXT -config <( \\
       printf "[dn]\\nCN=${host}\\n[req]\\ndistinguished_name = dn\\n[EXT]\\nsubjectAltName=DNS:${host},DNS:proxy,DNS:${proxyName}\\nkeyUsage=digitalSignature\\nextendedKeyUsage=serverAuth")
  `;
  log.info(command);
  const out = await execute({ command, pwd, log });
  if (out) {
    log.info('\n', out);
  }
}
