import { getCertPath } from '../tools/certPaths.js';
import { checkCommand, executeSpawn } from '../../../utils/execute.js';
import { getLog } from '../../../utils/log.js';

const log = getLog('unregisterCertificate');

export async function unregisterCertificate({ pwd }) {
  const { certPath } = getCertPath({ pwd });
  if (!(await checkCommand({ pwd, commandBin: 'security', sudo: true }))) {
    return false;
  }
  const command = `sudo security remove-trusted-cert -d ${certPath}`;
  try {
    await executeSpawn({ command, pwd, log });
    return true;
  } catch (error) {
    log.notice(`Failed to unregister cert:`, error);
    return false;
  }
}
