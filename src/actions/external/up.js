import { getInternalNodeService } from '../../utils/services.js';
import { checkProject } from '../internal/check/checkProject.js';
import { runServiceWithDependencies } from '../internal/services/runServiceWithDependencies.js';

export async function up({ pwd, params: [serviceName] = [] }) {
  const { name } = await getInternalNodeService({ serviceName, pwd });
  await checkProject({ pwd, params: [serviceName] });
  await runServiceWithDependencies({ pwd, params: [name] });
}
