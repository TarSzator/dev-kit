import YAML from 'yaml';
import { resolve } from 'path';
import { exists, hasWriteAccess, readFile, writeFile } from '../../../utils/fs.js';
import { EnvironmentError } from '../../../utils/errors/index.js';
import { getLog } from '../../../utils/log.js';
import InvalidInputError from '../../../utils/errors/InvalidInputError.js';

const log = getLog('dockerCompose');

export async function updateService({ pwd, serviceName, processor }) {
  const filePath = resolve(pwd, './docker-compose.yml');
  if (!(await exists(filePath))) {
    throw new EnvironmentError(1619590216, `Could not find docker compose file`);
  }
  if (!(await hasWriteAccess(filePath))) {
    throw new EnvironmentError(1619590306, `No write access to existing docker compose file`);
  }
  const existingDcContent = await readFile(filePath);
  const dc = YAML.parse(existingDcContent) || {};
  const { services } = dc;
  const serviceConfig = services[serviceName];
  if (!serviceConfig) {
    throw new InvalidInputError(
      1619590437,
      `Service "${serviceName}" not found in docker compose file`
    );
  }
  const { changed, serviceConfig: newServiceConfig } = await processor({ serviceConfig });
  if (!changed) {
    return;
  }
  dc.services = {
    ...dc.services,
    [serviceName]: newServiceConfig,
  };
  await writeFile(filePath, YAML.stringify(dc));
  log.notice(`Updated service config "${serviceName}" in docker compose file`);
}
