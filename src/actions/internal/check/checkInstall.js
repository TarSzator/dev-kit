import { resolve } from 'path';
import { exists } from '../../../utils/fs.js';
import { getService } from '../../../utils/services.js';
import { install } from '../../external/install.js';
import { checkProject } from './checkProject.js';
import InvalidInputError from '../../../utils/errors/InvalidInputError.js';

export async function checkInstall({ pwd, params: [serviceName] = [] }) {
  const { isInternal, localPath } = await getService(serviceName);
  if (!isInternal) {
    throw new InvalidInputError(
      1615909526,
      `Internal check install is not a valid operation for non-internal service "${serviceName}"`
    );
  }
  const projectPath = resolve(pwd, localPath);
  await checkProject({ pwd, params: [serviceName] });
  if (await exists(resolve(projectPath, 'node_modules'))) {
    return;
  }
  await install({ pwd, params: [serviceName] });
}
