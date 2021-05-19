import { getService } from '../../../utils/services.js';
import { InvalidConfigError } from '../../../utils/errors/index.js';
import { waterfall } from '../../../utils/promise.js';

export async function getAllServiceDependencies({ pwd, params: [serviceName] = [] }) {
  const dependencies = await getServiceDependencies({
    serviceName,
    pwd,
    store: new Map(),
  });
  checkForCircles(dependencies);
  return orderDependencies(dependencies, serviceName);
}

async function getServiceDependencies({ pwd, serviceName, store }) {
  if (store.has(serviceName)) {
    return store;
  }
  const { name, dependencies } = await getService({ serviceName, pwd });
  store.set(name, dependencies);
  return waterfall(
    dependencies.map(
      (dependentServiceName) => async (currentStore) =>
        getServiceDependencies({
          pwd,
          serviceName: dependentServiceName,
          store: currentStore,
        })
    ),
    store
  );
}

function checkForCircles(dependencies) {
  const visited = new Set();
  const recursions = new Set();
  const servicesWithDependencyCircle = [...dependencies.keys()].filter((serviceName) =>
    hasCircle({
      serviceName,
      dependencies,
      visited,
      recursions,
    })
  );
  if (servicesWithDependencyCircle.length) {
    throw new InvalidConfigError(
      1618516959,
      `Dependency loop for services "${servicesWithDependencyCircle.join('", ')}"`
    );
  }
}

function hasCircle({ serviceName, dependencies, visited, recursions }) {
  if (recursions.has(serviceName)) {
    return true;
  }
  if (visited.has(serviceName)) {
    return false;
  }
  visited.add(serviceName);
  recursions.add(serviceName);
  const requiredServices = dependencies.get(serviceName);
  if (
    requiredServices.find((s) => hasCircle({ serviceName: s, dependencies, visited, recursions }))
  ) {
    return true;
  }
  recursions.delete(serviceName);
  return false;
}

function orderDependencies(dependencies, serviceName) {
  const nodes = new Map();
  createNode({ serviceName, dependencies, nodes, level: 0 });
  const order = [...nodes.values()].reduce((memo, node) => {
    const { serviceName: sn, level } = node;
    memo[level] = [...(memo[level] || []), sn]; // eslint-disable-line no-param-reassign
    return memo;
  }, []);
  return order.slice(1).reverse();
}

function createNode({ serviceName, dependencies, nodes, level }) {
  const existingNode = nodes.get(serviceName);
  if (existingNode) {
    if (existingNode.level < level) {
      existingNode.level = level;
    }
    return existingNode;
  }
  const node = {
    serviceName,
    children: [],
    level,
  };
  nodes.set(serviceName, node);
  const requiredServiceNames = dependencies.get(serviceName);
  node.children = requiredServiceNames.map((sn) =>
    createNode({ serviceName: sn, dependencies, nodes, level: level + 1 })
  );
  return node;
}
