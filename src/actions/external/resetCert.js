import { getLog } from '../../utils/log.js';
import { prepareCertificate, purgeCertificate } from '../internal';

const log = getLog('resetCert');

export async function resetCert({ pwd }) {
  log.info(`Resetting certificate ...`);
  await purgeCertificate({ pwd });
  await prepareCertificate({ pwd });
  log.info(`... certificate reset.`);
}
