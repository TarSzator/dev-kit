import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export function getProjectPath(path) {
  const relativePath = path[0] === '/' ? path.substr(1) : path;
  return join(dirname(fileURLToPath(import.meta.url)), '../../', relativePath);
}

export function determineAbsoluteFilePath(projectPath, path) {
  if (path[0] === '/') return path;
  return join(projectPath, path);
}
