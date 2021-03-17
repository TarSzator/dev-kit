import YAML from 'yaml';
import { getProjectPath } from '../utils/path.js';
import { exists, hasReadAccess, hasWriteAccess, readFile, writeFile } from '../utils/fs.js';
import { EnvironmentError, InternalError, InvalidConfigError } from '../utils/errors/index.js';
import { getLog } from '../utils/log.js';
import { INTERNAL_SERVICES } from '../consts/index.js';
import { waterfall } from '../utils/promise.js';
import { updateServiceConfig } from './tools/update-service-config.js';
import { isEmpty } from '../utils/validators.js';

const log = getLog('prepareDockerCompose');

export async function prepareDockerCompose({ filePath }) {
  log.info(`Checking docker compose file ...`);
  const dcTemplatePath = getProjectPath('templates/docker-compose.yml');
  const dcTemplateContent = await readFile(dcTemplatePath);
  if (!(await exists(filePath))) {
    log.info(`... docker compose file does not exist. Creating ...`);
    await writeFile(filePath, dcTemplateContent);
    log.info(`... created docker-compose.yml file.`);
    return;
  }
  if (!(await hasReadAccess(filePath))) {
    throw new EnvironmentError(1615585943, `No read access to existing docker compose file`);
  }
  const existingDcContent = await readFile(filePath);
  const dcTemplate = YAML.parse(dcTemplateContent) || {};
  const dc = YAML.parse(existingDcContent) || {};
  const { services, networks } = dc;

  let networksChanged = false;
  log.info(`... checking network config ...`);
  if (!networks || Object.keys(networks).length === 0) {
    log.info(`... adding missing networks section ...`);
    dc.networks = dcTemplate.networks;
    networksChanged = true;
  } else {
    const [netKey] = Object.keys(dcTemplate.networks);
    const netKeys = Object.keys(networks);
    if (netKeys.length > 1 && !netKeys.includes(netKey)) {
      throw new InvalidConfigError(
        1615588736,
        `Multiple networks configured. Non is "${netKey}". Could not determine primary network for mandatory services.`
      );
    }
  }
  const [primaryNetworkKey] = Object.keys(dc.networks);
  log.info(`... determined primary network key as: ${primaryNetworkKey} ...`);
  const [devKitKey, proxyKey] = Object.keys(dcTemplate.services);
  if (devKitKey !== INTERNAL_SERVICES.DEV_KIT || proxyKey !== INTERNAL_SERVICES.PROXY) {
    throw InternalError(
      1615589109,
      `Misconfiguration in docker-compose.yml template. First service should be dev-kit. Second one proxy.`
    );
  }
  const { config: devKitConfig, changed: devKitChanged } = prepareServiceConfig({
    serviceKey: devKitKey,
    existingServices: services,
    serviceTemplates: dcTemplate.services,
    primaryNetworkKey,
  });
  if (devKitChanged) {
    services[devKitKey] = devKitConfig;
    log.info(`... updated ${devKitKey} service config ...`);
  }
  const { config: proxyConfig, changed: proxyChanged } = prepareServiceConfig({
    serviceKey: proxyKey,
    existingServices: services,
    serviceTemplates: dcTemplate.services,
    primaryNetworkKey,
  });
  if (proxyChanged) {
    services[proxyKey] = proxyConfig;
    log.info(`... updated ${proxyKey} service config ...`);
  }
  const changedServices = await waterfall(
    Object.keys(dc.services).map((serviceName) => async (s) => {
      const { changed, config: preparedConfig } = await updateServiceConfig({
        serviceName,
        serviceConfigs: dc.services,
      });
      if (!changed) {
        return s;
      }
      return {
        ...s,
        [serviceName]: preparedConfig,
      };
    }),
    {}
  );
  if (!networksChanged && !devKitChanged && !proxyChanged && isEmpty(changedServices)) {
    log.info(`... no changes to docker compose files were needed.`);
    return;
  }
  dc.services = {
    ...dc.services,
    ...changedServices,
  };
  if (!(await hasWriteAccess(filePath))) {
    throw new EnvironmentError(1615589684, `No write access to existing docker compose file`);
  }
  await writeFile(filePath, YAML.stringify(dc));
  log.info(`... saved updated docker compose file.`);
}

function prepareServiceConfig({
  serviceKey,
  existingServices,
  serviceTemplates,
  primaryNetworkKey,
}) {
  log.info(`... checking ${serviceKey} service config ...`);
  let changed = false;
  const config = {
    ...(existingServices[serviceKey] || serviceTemplates[serviceKey]),
  };
  if (!existingServices[serviceKey]) {
    log.info(`... adding ${serviceKey} service config ...`);
    changed = true;
  }
  if (config.networks[0] !== primaryNetworkKey) {
    log.info(`... fixing ${serviceKey} service network config ...`);
    config.networks = [primaryNetworkKey];
    changed = true;
  }
  if (!changed) {
    log.info(`... ${serviceKey} service config alright ...`);
  }
  return { config, changed };
}
