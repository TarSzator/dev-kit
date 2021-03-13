import { resolve } from 'path';
import { exists, writeFile } from '../../utils/fs.js';
import { getLog } from '../../utils/log.js';
import { checkFolder } from './tools/folder-check.js';

const log = getLog('prepareCertFolder');

export async function prepareCertFolder({ pwd }) {
  log.info(`Checking cert folder ...`);
  const certFolderPath = resolve(pwd, 'cert');
  await checkFolder({
    label: 'cert',
    folderPath: certFolderPath,
    log,
  });
  const keepFilePath = resolve(certFolderPath, '.keep');
  if (!(await exists(keepFilePath))) {
    log.info(`... keep file in cert folder does not exist. Creating ...`);
    await writeFile(keepFilePath, '# File so the folder stays in GIT');
    log.info(`... created keep file in cert folder ...`);
  }
  log.info(`... cert folder prepared.`);
}
