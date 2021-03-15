import { createFolder, exists, hasWriteAccess, isFolder, removeFile } from '../../utils/fs.js';
import { EnvironmentError, SkippedError } from '../../utils/errors/index.js';
import { requestConfirmation } from '../../utils/io.js';

export async function checkFolder({ label, folderPath, log }) {
  if (!(await exists(folderPath))) {
    log.info(`... ${label} folder does not exist. Creating ...`);
    await createFolder(folderPath);
    log.info(`... created ${label} folder ...`);
  }
  if (!(await isFolder(folderPath))) {
    if (!(await hasWriteAccess(folderPath))) {
      throw new EnvironmentError(1615633383, `No write access to existing ${label} file`);
    }
    if (
      !(await requestConfirmation({
        query: `Existing path "${folderPath}" is not a folder. Will remove existing file and create the ${label} folder instead. [Yn]`,
      }))
    ) {
      throw new SkippedError(`Skip overwriting ${label} file to create folder`);
    }
    log.info(`... removing ${label} file ...`);
    await removeFile(folderPath);
    log.info(`... creating ${label} folder ...`);
    await createFolder(folderPath);
    log.info(`... created ${label} folder ...`);
  }
}
