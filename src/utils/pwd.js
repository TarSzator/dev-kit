import { join, dirname } from 'path';
import { exists, getFileStats, readLink } from './fs.js';
import { waterfall } from './promise.js';
import { createSingleton } from './singleton.js';
import { EnvironmentError } from './errors/index.js';

const NEEDED_FILES = ['.env', 'docker-compose.yml'];

export const getPwd = createSingleton(determinePwd);

async function determinePwd() {
  const cwd = process.cwd();
  const [, script] = process.argv;
  if (script.indexOf(cwd) === 0 && (await isValidFolder(cwd))) {
    return cwd;
  }
  return searchForProjectPath(script);
}

async function isValidFolder(path) {
  return waterfall(
    NEEDED_FILES.map((filename) => async (isValid) => {
      if (!isValid) {
        return false;
      }
      return exists(join(path, filename));
    }),
    true
  );
}

async function searchForProjectPath(path) {
  const targetPath = await getFinalAbsolutePath(path);
  const { isFile, isDirectory } = await getFileStats(targetPath);
  if (isFile) {
    const projectPath = join(dirname(targetPath), '..');
    return searchForProjectPath(projectPath);
  }
  if (!isDirectory) {
    throw new EnvironmentError(1619022658, 'Determined project folder is invalid.', {
      path,
      targetPath,
    });
  }
  if (!(await isValidFolder(targetPath))) {
    throw new EnvironmentError(
      1619019265,
      `Could not determine project folder due to missing ${NEEDED_FILES.join(' or ')}`,
      {
        path,
        targetPath,
      }
    );
  }
  return targetPath;
}

async function getFinalAbsolutePath(path) {
  const linkedPath = await getSaveAbsoluteLinkPath(path);
  if (!linkedPath) {
    return path;
  }
  return getFinalAbsolutePath(linkedPath);
}

async function getSaveAbsoluteLinkPath(path) {
  const relLinkPath = await readLink(path);
  if (!relLinkPath) {
    return null;
  }
  return join(dirname(path), relLinkPath);
}
