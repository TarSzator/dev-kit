import { resolve } from 'path';
import {
  createFolder,
  exists,
  hasWriteAccess,
  isFolder,
  removeFile,
  writeFile,
} from '../../utils/fs.js';
import { EnvironmentError, SkippedError } from '../../utils/errors/index.js';
import { getLog } from '../../utils/log.js';
import { requestConfirmation } from '../../utils/io.js';

const log = getLog('prepareCertFolder');

export async function prepareCertFolder({ pwd }) {
  log.info(`Checking cert folder ...`);
  const certFolderPath = resolve(pwd, 'cert');
  if (!(await exists(certFolderPath))) {
    log.info(`... cert folder does not exist. Creating ...`);
    await createFolder(certFolderPath);
    log.info(`... created cert folder ...`);
  }
  if (!(await isFolder(certFolderPath))) {
    if (!(await hasWriteAccess(certFolderPath))) {
      throw new EnvironmentError(1615633383, `No write access to existing cert file`);
    }
    if (
      !(await requestConfirmation({
        query: `Existing path "${certFolderPath}" is not a folder. Will remove existing file and create the cert folder instead. [Yn]`,
      }))
    ) {
      throw new SkippedError(`Skip overwriting cert file to create folder`);
    }
    log.info(`... removing cert file ...`);
    await removeFile(certFolderPath);
    log.info('... creating cert folder ...');
    await createFolder(certFolderPath);
    log.info('... created cert folder ...');
  }
  const keepFilePath = resolve(certFolderPath, '.keep');
  if (!(await exists(keepFilePath))) {
    log.info(`... keep file in cert folder does not exist. Creating ...`);
    await writeFile(keepFilePath, '# File so the folder stays in GIT');
    log.info(`... created keep file in cert folder ...`);
  }
  log.info(`... cert folder prepared.`);
}
