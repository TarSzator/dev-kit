import { getCertPath } from '../tools/certPaths.js';
import { getMandatoryEnvValue } from '../../../utils/env.js';
import { executeSpawn } from '../../../utils/execute.js';

export async function generateCertificate({ pwd }) {
  const { certPath, certKeyPath } = getCertPath({ pwd });
  const host = getMandatoryEnvValue('HOST');
  const command = `
    openssl req -x509 -out ${certPath} -keyout ${certKeyPath} \\
      -newkey rsa:2048 -nodes -sha256 \\
      -subj "/CN=${host}" -extensions EXT -config <( \\
       printf "[dn]\\nCN=${host}\\n[req]\\ndistinguished_name = dn\\n[EXT]\\nsubjectAltName=DNS:${host}\\nkeyUsage=digitalSignature\\nextendedKeyUsage=serverAuth")
  `;
  await executeSpawn({ command, pwd });
}
