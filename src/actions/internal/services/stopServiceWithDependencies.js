import { getService } from '../../../utils/services.js';
import { getAllServiceDependencies } from './getAllServiceDependencies.js';
import { stopServiceIfNotNeeded } from './stopServiceIfNotNeeded.js';
import { stopService } from './stopService.js';

export async function stopServiceWithDependencies({ pwd, params: [serviceName] = [] }) {
  const { name } = await getService({ serviceName, pwd });
  const dependencies = await getAllServiceDependencies({ pwd, params: [name] });
  await Promise.all(
    dependencies.map((s) => stopServiceIfNotNeeded({ pwd, params: [s, [...dependencies, name]] }))
  );
  await stopService({ pwd, params: [name] });
}
