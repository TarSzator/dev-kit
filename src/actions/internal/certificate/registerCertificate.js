import { getCertPath } from '../tools/certPaths.js';
import { execute } from '../../../utils/execute.js';

export async function registerCertificate({ pwd }) {
  const { certPath } = getCertPath({ pwd });
  const command = `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certPath}`;
  await execute({ command, pwd });
}
