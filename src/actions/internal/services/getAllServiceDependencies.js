import { getService } from '../../../utils/services.js';
import { InvalidConfigError } from '../../../utils/errors/index.js';

export async function getAllServiceDependencies({ pwd, params: [serviceName] = [] }) {
  const dependencies = await getServiceDependencies({ serviceName, pwd });
  const uniqueDependencies = new Set(dependencies);
  uniqueDependencies.delete(serviceName);
  return [...uniqueDependencies];
}

async function getServiceDependencies({ pwd, serviceName }) {
  const { name, dependencies } = await getService({ serviceName, pwd });
  const allDependencies = !dependencies.length
    ? []
    : await Promise.all(dependencies.map((s) => getServiceDependencies({ pwd, serviceName: s })));
  const uniqueDependencies = new Set(allDependencies.flat());
  if (uniqueDependencies.has(name)) {
    throw new InvalidConfigError(1618516959, `Dependency loop for service "${name}"`);
  }
  uniqueDependencies.add(name);
  return [...uniqueDependencies];
}
