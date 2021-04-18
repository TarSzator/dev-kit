import { getService } from '../../../utils/services.js';
import { getAllServiceDependencies } from './getAllServiceDependencies.js';
import { stopServiceIfNotNeeded } from './stopServiceIfNotNeeded.js';
import { stopService } from './stopService.js';
import { runForDependencies } from '../tools/runForDependencies.js';

export async function stopServiceWithDependencies({ pwd, params: [serviceName] = [] }) {
  const { name } = await getService({ serviceName, pwd });
  const dependencies = await getAllServiceDependencies({ pwd, params: [name] });
  const flatDependencies = dependencies.flat();
  await runForDependencies({
    dependencies,
    runner: async (s) => stopServiceIfNotNeeded({ pwd, params: [s, [...flatDependencies, name]] }),
  });
  await stopService({ pwd, params: [name] });
}
