import { getInternalNodeService } from '../../utils/services.js';
import { checkProject, stopServiceWithDependencies } from '../internal/index.js';

export async function down({ pwd, params: [serviceName] = [] }) {
  const { name } = await getInternalNodeService({ serviceName, pwd });
  await checkProject({ pwd, params: [serviceName] });
  await stopServiceWithDependencies({ pwd, params: [name] });
}
