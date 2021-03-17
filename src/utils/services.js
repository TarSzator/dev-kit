import { createService } from '../models/Service.js';
import { getDockerServices } from './docker-compose.js';
import InvalidInputError from './errors/InvalidInputError.js';
import { isNonEmptyString } from './validators.js';

const services = new Map();

export async function getInternalServiceNames() {
  const servicesConfigured = await getDockerServices();
  const allServices = await Promise.all(
    Object.keys(servicesConfigured).map((serviceName) => getService(serviceName))
  );
  return allServices.filter(({ isInternal }) => isInternal).map(({ name }) => name);
}

export async function getService(serviceName) {
  if (!isNonEmptyString(serviceName)) {
    throw new InvalidInputError(1615901701, `No service provided`);
  }
  if (!services.has(serviceName)) {
    services.set(serviceName, retrieveService(serviceName));
  }
  return services.get(serviceName);
}

async function retrieveService(serviceName) {
  const servicesConfigured = await getDockerServices();
  if (!servicesConfigured[serviceName]) {
    throw new InvalidInputError(1615900211, `No service found with name: "${serviceName}"`);
  }
  return createService(
    serviceName,
    servicesConfigured[serviceName],
    Object.keys(servicesConfigured)
  );
}
