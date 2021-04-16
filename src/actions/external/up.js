import { getInternalNodeService } from '../../utils/services.js';
import { checkProject, runServiceWithDependencies } from '../internal/index.js';

export async function up({ pwd, params: [serviceName] = [] }) {
  const { name } = await getInternalNodeService({ serviceName, pwd });
  await checkProject({ pwd, params: [serviceName] });
  await runServiceWithDependencies({ pwd, params: [name] });
}
