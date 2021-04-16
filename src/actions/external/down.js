import { getInternalNodeService } from '../../utils/services.js';
import { checkProject } from '../internal/check/checkProject.js';
import { stopServiceWithDependencies } from '../internal/services/stopServiceWithDependencies.js';

export async function down({ pwd, params: [serviceName] = [] }) {
  const { name } = await getInternalNodeService({ serviceName, pwd });
  await checkProject({ pwd, params: [serviceName] });
  await stopServiceWithDependencies({ pwd, params: [name] });
}
