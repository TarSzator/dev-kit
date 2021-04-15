import { createService } from '../models/Service.js';
import { getDockerServices } from './docker-compose.js';
import InvalidInputError from './errors/InvalidInputError.js';
import { isNonEmptyString } from './validators.js';

const services = new Map();

async function getAllServices({ pwd }) {
  const servicesConfigured = await getDockerServices();
  return Promise.all(
    Object.keys(servicesConfigured).map((serviceName) => getService({ serviceName, pwd }))
  );
}

export async function getInternalServiceNames({ pwd }) {
  const allServices = await getAllServices({ pwd });
  return allServices.filter(({ isInternal }) => !!isInternal).map(({ name }) => name);
}

export async function getNotInternalServiceNames({ pwd }) {
  const allServices = await getAllServices({ pwd });
  return allServices.filter(({ isInternal }) => !isInternal).map(({ name }) => name);
}

export async function getInternalService({ serviceName, pwd }) {
  const service = await getService({ serviceName, pwd });
  const { isInternal } = service;
  if (!isInternal) {
    throw new InvalidInputError(
      1618476476,
      `Not a valid operation for non-internal service "${serviceName}"`
    );
  }
  return service;
}

export async function getInternalNodeService({ serviceName, pwd }) {
  const service = await getInternalService({ serviceName, pwd });
  const { isNode } = service;
  if (!isNode) {
    throw new InvalidInputError(
      1618476485,
      `Not a valid operation for non-node service "${serviceName}"`
    );
  }
  return service;
}

export async function getService({ serviceName, pwd }) {
  if (!isNonEmptyString(serviceName)) {
    throw new InvalidInputError(1615901701, `No service provided`);
  }
  if (!services.has(serviceName)) {
    services.set(serviceName, retrieveService({ serviceName, pwd }));
  }
  return services.get(serviceName);
}

async function retrieveService({ serviceName, pwd }) {
  const servicesConfigured = await getDockerServices();
  if (!servicesConfigured[serviceName]) {
    throw new InvalidInputError(1615900211, `No service found with name: "${serviceName}"`);
  }
  return createService(
    serviceName,
    pwd,
    servicesConfigured[serviceName],
    Object.keys(servicesConfigured)
  );
}
