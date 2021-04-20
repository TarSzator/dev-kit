import { getService } from '../../../utils/services.js';
import { runService } from './runService.js';
import { getAllServiceDependencies } from './getAllServiceDependencies.js';
import { runForDependencies } from '../tools/runForDependencies.js';

export async function runServiceWithDependencies({
  pwd,
  params: [serviceName, skipHealthcheck = false] = [],
}) {
  const { name } = await getService({ serviceName, pwd });
  const dependencies = await getAllServiceDependencies({ pwd, params: [name] });
  await runForDependencies({
    dependencies,
    runner: async (s) => runService({ pwd, params: [s] }),
  });
  await runService({ pwd, params: [name, skipHealthcheck] });
}
