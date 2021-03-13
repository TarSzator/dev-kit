import { resolve } from 'path';
import { checkFolder } from './tools/folder-check.js';
import { exists, hasReadAccess, hasWriteAccess, readFile, writeFile } from '../../utils/fs.js';
import { getLog } from '../../utils/log.js';
import { getProjectPath } from '../../utils/path.js';
import { EnvironmentError } from '../../utils/errors/index.js';
import { readLine } from '../../utils/io.js';

const log = getLog('prepareRun');

const BIN_PATH = './bin/run.js';
const PACKAGE_TYPE = 'module';

export async function prepareRun({ pwd }) {
  log.info(`Checking bin folder ...`);
  const binFolderPath = resolve(pwd, 'bin');
  await checkFolder({
    label: 'bin',
    folderPath: binFolderPath,
    log,
  });
  const runFilePath = resolve(binFolderPath, 'run.js');
  const runTemplatePath = getProjectPath('templates/run.js');
  const runTemplateContent = await readFile(runTemplatePath);
  if (!(await exists(runFilePath))) {
    log.info(`... run file in bin folder does not exist. Creating ...`);
    await writeFile(runFilePath, runTemplateContent);
    log.info(`... created run file in bin folder ...`);
  }
  if (!(await hasReadAccess(runFilePath))) {
    throw new EnvironmentError(1615669511, `No read access to existing run file in bin folder`);
  }
  const runContent = await readFile(runFilePath);
  if (runContent === runTemplateContent) {
    log.info(`... run file in bin folder checked ...`);
  } else {
    log.info(`... run file in bin folder has outdated content. Updating ...`);
    if (!(await hasWriteAccess(runFilePath))) {
      throw new EnvironmentError(1615669554, `No write access to existing run file in bin folder`);
    }
    await writeFile(runFilePath, runTemplateContent);
    log.info(`... run file in bin folder has updated ...`);
  }
  log.info(`... checking package.json ...`);
  const packageJsonPath = resolve(pwd, 'package.json');
  if (!(await hasReadAccess(packageJsonPath))) {
    throw new EnvironmentError(1615669897, `No read access to existing package.json file`);
  }
  const packageJsonContent = await readFile(packageJsonPath);
  const packageJson = JSON.parse(packageJsonContent);
  let packageJsonChanged = false;
  const { type, main, bin } = packageJson;
  if (type !== PACKAGE_TYPE) {
    log.info(`... invalid package type. Setting it to "${PACKAGE_TYPE}" ...`);
    packageJson.type = PACKAGE_TYPE;
    packageJsonChanged = true;
  }
  if (main !== BIN_PATH) {
    log.info(`... invalid main. Setting it to "${BIN_PATH}" ...`);
    packageJson.main = BIN_PATH;
    packageJsonChanged = true;
  }
  if (!checkBin(bin)) {
    log.info(`... invalid bin. Setting bin config ...`);
    const binKey = await getBinName();
    packageJson.bin = {
      ...(bin || {}),
      [binKey]: BIN_PATH,
    };
    packageJsonChanged = true;
  }
  if (!packageJsonChanged) {
    log.info(`... package.json checked.`);
    return;
  }
  log.info(`... updating package.json ...`);
  if (!(await hasWriteAccess(packageJsonPath))) {
    throw new EnvironmentError(1615670381, `No write access to existing package.json`);
  }
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, '  ')}\n`);
  log.info(`... package.json updated.`);
}

function checkBin(bin) {
  if (!bin) {
    return false;
  }
  return Object.values(bin).includes(BIN_PATH);
}

async function getBinName() {
  const binKey = await readLine({
    query: 'Please enter the bin name how to access the future dev-kit. (e.g.: myProjectCtrl):',
  });
  if (!binKey || typeof binKey !== 'string' || !binKey.trim()) {
    log.warn('Invalid bin name provided. Try again.');
    return getBinName();
  }
  return binKey;
}
