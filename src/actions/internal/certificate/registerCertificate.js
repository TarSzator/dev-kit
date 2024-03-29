import { getCertPath } from '../tools/certPaths.js';
import { checkCommand, executeSpawn } from '../../../utils/execute.js';
import { getLog } from '../../../utils/log.js';

const log = getLog('registerCertificate');

export async function registerCertificate({ pwd }) {
  const { certPath } = getCertPath({ pwd });
  if (!(await checkCommand({ pwd, commandBin: 'security', sudo: true }))) {
    return false;
  }
  const command = `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certPath}`;
  await executeSpawn({ command, pwd, log });
  return true;
}
