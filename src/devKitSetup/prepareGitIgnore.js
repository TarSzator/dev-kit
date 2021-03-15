import { resolve } from 'path';
import { getProjectPath } from '../utils/path.js';
import { exists, hasReadAccess, hasWriteAccess, readFile, writeFile } from '../utils/fs.js';
import { EnvironmentError } from '../utils/errors/index.js';
import { getLog } from '../utils/log.js';

const log = getLog('prepareGitIgnore');

export async function prepareGitIgnore({ pwd }) {
  log.info(`Checking git ignore file ...`);
  const filePath = resolve(pwd, '.gitignore');
  const gitIgnoreTemplatePath = getProjectPath('templates/_gitignore');
  const gitIgnoreTemplateContent = await readFile(gitIgnoreTemplatePath);
  if (!(await exists(filePath))) {
    log.info(`... .gitignore does not exist. Creating ...`);
    await writeFile(filePath, gitIgnoreTemplateContent);
    log.info(`... created git ignore file.`);
    return;
  }
  if (!(await hasReadAccess(filePath))) {
    throw new EnvironmentError(1615630781, `No read access to existing git ignore file`);
  }
  const existingGitIgnoreContent = await readFile(filePath);
  const requiredEntries = filteredEntries(gitIgnoreTemplateContent);
  const existingEntries = filteredEntries(existingGitIgnoreContent);
  const missingEntries = requiredEntries.filter((k) => !existingEntries.includes(k));
  if (!missingEntries.length) {
    log.info(`... git ignore file already contains all mandatory entries`);
    return;
  }
  if (!(await hasWriteAccess(filePath))) {
    throw new EnvironmentError(1615631064, `No write access to existing git ignore file`);
  }
  log.info(`... adding missing entries to git ignore: "${missingEntries.join('", "')}"`);
  const newGitIgnoreContent = [...existingEntries, ...missingEntries, ''].join('\n');
  await writeFile(filePath, newGitIgnoreContent);
  log.info(`... added missing entries to git ignore file.`);
}

function filteredEntries(content) {
  return content
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => !!s);
}
