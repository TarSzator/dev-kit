import { constants } from 'fs';
import { access, stat, mkdir, rm, readFile as rf, writeFile as wf, readlink } from 'fs/promises';

export async function exists(path) {
  return hasAccess(path);
}

export async function hasWriteAccess(path) {
  return hasAccess(path, constants.W_OK);
}

export async function hasReadAccess(path) {
  return hasAccess(path, constants.R_OK);
}

async function hasAccess(path, mode) {
  try {
    // eslint-disable-next-line no-bitwise
    const m = mode ? constants.F_OK | mode : constants.F_OK;
    await access(path, m);
    return true;
  } catch (error) {
    return false;
  }
}

export async function getFileStats(path) {
  const file = await stat(path);
  return {
    isDirectory: file.isDirectory(),
    isFile: file.isFile(),
    isSymLink: file.isSymbolicLink(),
  };
}

export async function isFolder(path) {
  try {
    const { isDirectory } = await getFileStats(path);
    return isDirectory;
  } catch (error) {
    return false;
  }
}

export async function readFile(path) {
  return rf(path, 'utf-8');
}

export async function writeFile(path, content, { mode } = {}) {
  return wf(path, content, { encoding: 'utf-8', mode: mode || 0o644 });
}

export async function createFolder(path) {
  return mkdir(path, { recursive: true, mode: 0o755 });
}

export async function removeFile(path) {
  return rm(path, { recursive: true });
}

export async function readLink(path) {
  return readlink(path, { encoding: 'utf-8' });
}
