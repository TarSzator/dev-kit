import { getService } from '../../../utils/services.js';
import { InvalidConfigError } from '../../../utils/errors/index.js';
import { waterfall } from '../../../utils/promise.js';

export async function getAllServiceDependencies({ pwd, params: [serviceName] = [] }) {
  const dependencies = await getServiceDependencies({
    serviceName,
    pwd,
    depth: 0,
    parentDependencies: new Set(),
  });
  const orderedLevels = Object.keys(dependencies)
    .map((k) => Number(k))
    .sort((a, b) => (a > b ? -1 : 1));
  const { cleanedDependencies: finalDependencies } = orderedLevels.reduce(
    ({ cleanedDependencies, flattenedDependencies }, level) => {
      const services = dependencies[level];
      const currentDependencies = [...services].filter((sn) => !flattenedDependencies.includes(sn));
      return {
        cleanedDependencies: [...cleanedDependencies, currentDependencies],
        flattenedDependencies: [...flattenedDependencies, ...currentDependencies],
      };
    },
    { cleanedDependencies: [], flattenedDependencies: [] }
  );
  return finalDependencies;
}

async function getServiceDependencies({ pwd, serviceName, depth, parentDependencies }) {
  const { name, dependencies } = await getService({ serviceName, pwd });
  const depthDependencies = depth ? { [depth]: new Set([name]) } : {};
  if (!dependencies.length) {
    return depthDependencies;
  }
  const loopServiceName = dependencies.find((d) => parentDependencies.has(d));
  if (loopServiceName) {
    throw new InvalidConfigError(1618516959, `Dependency loop for service "${loopServiceName}"`);
  }
  const newParentDependencies = new Set([...parentDependencies, ...dependencies]);
  return waterfall(
    dependencies.map((dependentServiceName) => async (depths) => {
      const newDependencies = await getServiceDependencies({
        pwd,
        serviceName: dependentServiceName,
        depth: depth + 1,
        parentDependencies: newParentDependencies,
      });
      return Object.entries(newDependencies).reduce(
        (s, [currentDepth, currentDependencies]) => ({
          ...s,
          [currentDepth]: new Set([...(s[currentDepth] || []), ...currentDependencies]),
        }),
        depths
      );
    }),
    depthDependencies
  );
}
