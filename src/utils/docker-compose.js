import { resolve } from 'path';
import YAML from 'yaml';
import { exists, hasReadAccess, readFile } from './fs.js';
import { EnvironmentError, InvalidConfigError } from './errors/index.js';
import { createSingleton } from './singleton.js';
import { isEmpty } from './validators.js';

export function getDockerComposePath({ path }) {
  return resolve(path, 'docker-compose.yml');
}

export const getDockerServices = createSingleton(retrieveDockerServices);

async function retrieveDockerServices() {
  const path = getDockerComposePath({ path: process.cwd() });
  if (!(await exists(path))) {
    throw new EnvironmentError(1614926669, `docker-compose.yml file does not exist at "${path}"`);
  }
  if (!(await hasReadAccess(path))) {
    throw new EnvironmentError(
      1614926730,
      `No read rights on docker-compose.yml file at "${path}"`
    );
  }
  const ymlFile = await readFile(path);
  if (!ymlFile.trim()) {
    throw new EnvironmentError(1614926738, `docker-compose.yml is empty at "${path}"`);
  }
  const { services = {} } = YAML.parse(ymlFile) || {};
  if (isEmpty(services)) {
    throw new InvalidConfigError(
      1614926748,
      `No services defined in docker-compose.yml at "${path}"`
    );
  }
  return services;
}
