import { getCertPath } from '../tools/certPaths.js';
import { execute } from '../../../utils/execute.js';
import { getLog } from '../../../utils/log.js';

const log = getLog('unregisterCertificate');

export async function unregisterCertificate({ pwd }) {
  const { certPath } = getCertPath({ pwd });
  const command = `sudo security remove-trusted-cert -d ${certPath}`;
  try {
    await execute({ command, pwd });
    return true;
  } catch (error) {
    log.notice(`Failed to unregister cert:`, error);
    return false;
  }
}
