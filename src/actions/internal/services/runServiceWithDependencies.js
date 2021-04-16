import { getService } from '../../../utils/services.js';
import { runService } from './runService.js';
import { getAllServiceDependencies } from './getAllServiceDependencies.js';

export async function runServiceWithDependencies({ pwd, params: [serviceName] = [] }) {
  const { name } = await getService({ serviceName, pwd });
  const dependencies = await getAllServiceDependencies({ pwd, params: [name] });
  await Promise.all(dependencies.map((s) => runService({ pwd, params: [s] })));
  await runService({ pwd, params: [name] });
}
