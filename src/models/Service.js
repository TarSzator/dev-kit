import { resolve } from 'path';
import { constantCase } from 'change-case';
import { LABELS, TYPES } from '../consts/index.js';
import { isNonEmptyString, isPositiveInteger } from '../utils/validators.js';
import { InvalidConfigError } from '../utils/errors/index.js';
import { parseCsv } from '../utils/csv.js';
import { getInvalidValues } from '../utils/array.js';

const LABEL_KEYS = Object.entries(LABELS).reduce((m, [k, { KEY }]) => ({ ...m, [k]: KEY }), {});

export function createService(serviceName, pwd, dockerComposeServiceConfig, services) {
  const service = {
    name: serviceName,
  };
  const { REPO_KEY, LOCAL_PATH_KEY } = getEnvKeys(serviceName);
  const { [REPO_KEY]: repo, [LOCAL_PATH_KEY]: localPath } = process.env;
  const {
    labels: {
      [LABEL_KEYS.TYPES]: typesConfig,
      [LABEL_KEYS.DEPENDENCIES]: dependenciesConfig,
      [LABEL_KEYS.OPEN_URL]: openUrl,
      [LABEL_KEYS.HEALTH_CHECK_TIMEOUT]: healthCheckTimeout,
    } = {},
    container_name: containerNameConfig,
    healthcheck,
  } = dockerComposeServiceConfig;
  if (!isNonEmptyString(typesConfig)) {
    throw new InvalidConfigError(
      1615908063,
      `Missing config label "${LABEL_KEYS.TYPES}" for service "${serviceName}"`
    );
  }
  const types = parseCsv(typesConfig);
  const invalidTypes = getInvalidValues(types, Object.values(TYPES));
  if (invalidTypes.length) {
    throw new InvalidConfigError(
      1615908670,
      `Invalid config for label "${
        LABEL_KEYS.TYPES
      }" for service "${serviceName}". Unknown types: '${invalidTypes.join(`', '`)}'`
    );
  }
  const dependencies = parseCsv(dependenciesConfig);
  const invalidDependencies = getInvalidValues(dependencies, services);
  if (invalidDependencies.length) {
    throw new InvalidConfigError(
      1615908806,
      `Invalid config for label "${
        LABEL_KEYS.DEPENDENCIES
      }" for service "${serviceName}". Unknown services: '${invalidDependencies.join(`', '`)}'`
    );
  }
  const hasHealthcheck = !!healthcheck;
  const isInternal = types.includes(TYPES.INTERNAL);
  const isNode = types.includes(TYPES.NODE);
  const isTool = types.includes(TYPES.TOOL);
  const isServer = types.includes(TYPES.SERVER);
  const isLinkSource = types.includes(TYPES.LINK_SOURCE);
  const isLinkTarget = types.includes(TYPES.LINK_TARGET);
  let projectPath;
  if (isInternal) {
    if (!isNonEmptyString(repo)) {
      throw new InvalidConfigError(1619201114, `Missing environment config for key "${REPO_KEY}"`);
    }
    if (!isNonEmptyString(localPath)) {
      throw new InvalidConfigError(
        1619201125,
        `Missing environment config for key "${LOCAL_PATH_KEY}"`
      );
    }
    projectPath = resolve(pwd, localPath);
  }
  if (healthCheckTimeout !== undefined && !isPositiveInteger(healthCheckTimeout)) {
    throw new InvalidConfigError(
      1734881536,
      `If set ${LABEL_KEYS.HEALTH_CHECK_TIMEOUT} must be a positive integer`
    );
  }
  return {
    ...service,
    containerName: getContainerName(serviceName, containerNameConfig),
    repo,
    localPath,
    projectPath,
    types,
    isInternal,
    isNode,
    isTool,
    isServer,
    isLinkSource,
    isLinkTarget,
    hasHealthcheck,
    healthCheckTimeout: healthCheckTimeout ?? 30,
    dependencies,
    openUrl: replaceEnvVariables(openUrl),
    localPathKey: LOCAL_PATH_KEY,
  };
}

function getEnvKeys(serviceName) {
  const ENV_NAME = constantCase(serviceName);
  return {
    REPO_KEY: `${ENV_NAME}_REPO`,
    LOCAL_PATH_KEY: `${ENV_NAME}_LOCAL_PATH`,
  };
}

function getContainerName(serviceName, containerNameConfig) {
  if (!containerNameConfig) {
    return serviceName;
  }
  if (containerNameConfig[0] !== '$') {
    return containerNameConfig;
  }
  const key = containerNameConfig.substr(1);
  return process.env[key] || serviceName;
}

function replaceEnvVariables(str) {
  if (!str) {
    return undefined;
  }
  return str.replace(/\$([A-Z0-9_]+)/g, (match, key) => {
    const value = process.env[key];
    return value === undefined ? match : value;
  });
}
