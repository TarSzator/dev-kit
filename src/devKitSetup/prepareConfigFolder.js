import { resolve } from 'path';
import { checkFolder } from './tools/folder-check.js';
import { exists, hasReadAccess, hasWriteAccess, readFile, writeFile } from '../utils/fs.js';
import { getLog } from '../utils/log.js';
import { getProjectPath } from '../utils/path.js';
import { EnvironmentError } from '../utils/errors/index.js';
import { FOLDER_NAMES } from '../consts';

const log = getLog('prepareConfigFolder');

export async function prepareConfigFolder({ pwd }) {
  log.info(`Checking config folder ...`);
  const configFolderPath = resolve(pwd, FOLDER_NAMES.CONFIG);
  await checkFolder({
    label: 'config',
    folderPath: configFolderPath,
    log,
  });
  log.info(`... config folder checked. Checking Caddyfile ...`);
  const caddyFilePath = resolve(configFolderPath, 'Caddyfile');
  const caddyTemplatePath = getProjectPath('templates/Caddyfile');
  const caddyTemplateContent = await readFile(caddyTemplatePath);
  if (!(await exists(caddyFilePath))) {
    log.info(`... Caddyfile in config folder does not exist. Creating ...`);
    await writeFile(caddyFilePath, caddyTemplateContent);
    log.info(`... created Caddyfile in config folder.`);
    return;
  }
  if (!(await hasReadAccess(caddyFilePath))) {
    throw new EnvironmentError(1615668068, `No read access to existing Caddyfile`);
  }
  const existingCaddyContent = await readFile(caddyFilePath);
  const needle = caddyTemplateContent.trim();
  if (existingCaddyContent.indexOf(needle) !== -1) {
    log.info(`... Caddyfile checked.`);
    return;
  }
  log.info(`... adding mandatory config to Caddyfile ...`);
  if (!(await hasWriteAccess(caddyFilePath))) {
    throw new EnvironmentError(1615668643, `No write access to existing Caddyfile`);
  }
  await writeFile(caddyFilePath, `${existingCaddyContent.trim()}\n\n${needle}\n`);
  log.info(`... added config to Caddyfile. Preparation done.`);
}
