import dotenv from 'dotenv';
import { getProjectPath } from '../utils/path.js';
import { exists, hasReadAccess, hasWriteAccess, readFile, writeFile } from '../utils/fs.js';
import { getLog } from '../utils/log.js';
import { EnvironmentError } from '../utils/errors/index.js';

const log = getLog('prepareEnv');

export async function prepareEnv({ filePath }) {
  log.info(`Checking env file ...`);
  const envTemplatePath = getProjectPath('templates/_env');
  const envTemplateContent = await readFile(envTemplatePath);
  if (!(await exists(filePath))) {
    log.info(`... env file does not exist. Creating ...`);
    await writeFile(filePath, envTemplateContent);
    const envExamplePath = `${filePath}.example`;
    if (!(await exists(envExamplePath))) {
      await writeFile(envExamplePath, envTemplateContent);
    }
    log.info(`... created env file.`);
    return;
  }
  if (!(await hasReadAccess(filePath))) {
    throw new EnvironmentError(1615317571, `No read access to existing environment file`);
  }
  const existingEnvContent = await readFile(filePath);
  const envTemplate = dotenv.parse(envTemplateContent);
  const env = dotenv.parse(existingEnvContent);
  const requiredKeys = Object.keys(envTemplate);
  const existingKeys = Object.keys(env);
  const missingKeys = requiredKeys.filter((k) => {
    if (!existingKeys.includes(k)) {
      return true;
    }
    const val = env[k];
    return !val.length;
  });
  if (!missingKeys.length) {
    log.info(`... env file already contains all mandatory keys`);
    return;
  }
  if (!(await hasWriteAccess(filePath))) {
    throw new EnvironmentError(1615318611, `No write access to existing environment file`);
  }
  const newEnv = {
    ...env,
    ...missingKeys.reduce(
      (m, k) => ({
        ...m,
        [k]: envTemplate[k],
      }),
      {}
    ),
  };
  const newEnvContent = Object.entries(newEnv).reduce(
    (m, [k, v]) => `${m}${k}='${String(v).replace(/'/g, `\\'`)}'\n`,
    ''
  );
  await writeFile(filePath, newEnvContent);
  log.info(`... added missing keys to env file.`);
}
