import { resolve } from 'path';
import YAML from 'yaml';
import { exists, hasReadAccess, readFile } from './fs.js';
import { InvalidConfigError } from './errors/index.js';

export function getDockerComposePath({ path }) {
  return resolve(path, 'docker-compose.yml');
}

export async function getServices() {
  const path = getDockerComposePath({ path: process.cwd() });
  if (!(await exists(path))) {
    throw new InvalidConfigError(1614926669, `docker-compose.yml file does not exist at "${path}"`);
  }
  if (!(await hasReadAccess(path))) {
    throw new InvalidConfigError(
      1614926730,
      `No read rights on docker-compose.yml file at "${path}"`
    );
  }
  const ymlFile = await readFile(path);
  if (!ymlFile.trim()) {
    throw new InvalidConfigError(1614926738, `docker-compose.yml is empty at "${path}"`);
  }
  const { services: serviceConfigs = {} } = YAML.parse(ymlFile) || {};
  const services = Object.keys(serviceConfigs);
  if (!services.length) {
    throw new InvalidConfigError(
      1614926748,
      `No services defined in docker-compose.yml at "${path}"`
    );
  }
  return services;
}
