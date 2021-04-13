import { getCertPath } from '../tools/certPaths.js';
import { removeFile } from '../../../utils/fs.js';

export async function removeCertificate({ pwd }) {
  const { certPath, certKeyPath } = getCertPath({ pwd });
  await Promise.all([removeFile(certPath), removeFile(certKeyPath)]);
}
