import { getService } from '../../utils/services.js';
import { stopServiceWithDependencies } from '../internal/index.js';

export async function down({ pwd, params: [serviceName] = [] }) {
  const { name } = await getService({ serviceName, pwd });
  await stopServiceWithDependencies({ pwd, params: [name] });
}
