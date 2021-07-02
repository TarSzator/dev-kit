import { resolve } from 'path';
import { exists } from '../../../utils/fs.js';
import { getInternalService } from '../../../utils/services.js';
import { install } from '../../external/install.js';
import { checkProject } from './checkProject.js';

export async function checkInstall({ pwd, params: [serviceName] = [] }) {
  const { projectPath, isNode } = await getInternalService({ serviceName, pwd });
  await checkProject({ pwd, params: [serviceName] });
  if (!isNode || (await exists(resolve(projectPath, 'node_modules')))) {
    return;
  }
  await install({ pwd, params: [serviceName] });
}
