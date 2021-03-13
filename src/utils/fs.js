import { constants } from 'fs';
import { access, stat, readFile as rf, writeFile as wf } from 'fs/promises';

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

export async function isFolder(path) {
  const file = await stat(path);
  return file.isDirectory();
}

export async function readFile(path) {
  return rf(path, 'utf-8');
}

export async function writeFile(path, content) {
  return wf(path, content, { encoding: 'utf-8', mode: 0o644 });
}
