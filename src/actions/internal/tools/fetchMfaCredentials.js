import { isNonEmptyString, isNumberLike } from '../../../utils/validators.js';
import { InvalidInputError } from '../../../utils/errors/index.js';
import { getService } from '../../../utils/services.js';
import { readLine } from '../../../utils/io.js';
import { executeSpawnSync } from '../../../utils/execute.js';
import { getMandatoryEnvValue } from '../../../utils/env.js';
import { parseCsv } from '../../../utils/csv.js';
import { runService } from '../services/runService.js';
import { stopService } from '../services/stopService.js';
import { getLog } from '../../../utils/log.js';

const log = getLog('fetchMfaCredentials');

export async function fetchMfaCredentials({
  pwd,
  params,
  internalParams: { keepServiceRunning = false } = {},
}) {
  const { serviceName, accountAlias } = processParams(params);
  const { name } = await getService({ serviceName, pwd });
  log.info(`Fetching credentials for account "${accountAlias}" via service "${serviceName}" ...`);
  const { id, secret, mfa, region } = getCredentialsByAccountAlias(accountAlias);
  await runService({ pwd, params: [name, true] });
  const {
    id: loginId,
    secret: loginSecret,
    sessionToken,
  } = await getLoginCredentials({ pwd, serviceName: name, id, secret, mfa });
  if (!keepServiceRunning) {
    await stopService({ pwd, params: [name] });
  }
  log.info('... received credentials.');
  return {
    id: loginId,
    secret: loginSecret,
    sessionToken,
    region,
    serviceName: name,
    accountAlias,
    mfa,
  };
}

function getCredentialsByAccountAlias(accountAlias) {
  const prefix = `${accountAlias.toUpperCase()}_`;
  const keys = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_MFA_DEVICE_ARN',
    'AWS_DEFAULT_REGION',
  ];
  const [idKey, secretKey, mfaKey, regionKey] = keys.map((key) => `${prefix}${key}`);
  const {
    [idKey]: id,
    [secretKey]: secret,
    [mfaKey]: mfa,
    [regionKey]: primaryRegion,
    AWS_DEFAULT_REGION: fallbackRegion,
  } = process.env;
  const region = primaryRegion || fallbackRegion;
  if (!isNonEmptyString(id)) {
    throw new InvalidInputError(
      1623597974,
      `Invalid ${idKey} provided for account "${accountAlias}"`
    );
  }
  if (!isNonEmptyString(secret)) {
    throw new InvalidInputError(
      1623598167,
      `Invalid ${secretKey} provided for account "${accountAlias}"`
    );
  }
  if (mfa && !isNonEmptyString(mfa)) {
    throw new InvalidInputError(
      1623598172,
      `Invalid ${mfaKey} provided for account "${accountAlias}"`
    );
  }
  if (!isNonEmptyString(region)) {
    throw new InvalidInputError(
      1624547294,
      `Invalid ${regionKey} provided for account "${accountAlias}" nor fallback AWS_DEFAULT_REGION`
    );
  }
  return {
    id,
    secret,
    mfa,
    region,
  };
}

async function getLoginCredentials({ pwd, serviceName, id, secret, mfa }) {
  if (!mfa) {
    return {
      id,
      secret,
    };
  }
  const oneTimePassword = await readLine({
    query: 'Please enter your one time password: ',
  });
  if (
    !isNonEmptyString(oneTimePassword) ||
    oneTimePassword.length !== 6 ||
    !isNumberLike(oneTimePassword)
  ) {
    throw new InvalidInputError(
      1623598178,
      `Invalid one time password provided: "${oneTimePassword}"`
    );
  }
  const command =
    `docker-compose exec -T ` +
    `-e AWS_ACCESS_KEY_ID=${id} ` +
    `-e AWS_SECRET_ACCESS_KEY=${secret} ` +
    `${serviceName} ` +
    `aws sts get-session-token --serial-number ${mfa} --token-code ${oneTimePassword}`;
  const credentials = executeSpawnSync({
    pwd,
    command,
    log,
    environmentExtension: {
      AWS_ACCESS_KEY_ID: id,
      AWS_SECRET_ACCESS_KEY: secret,
    },
    fetchOutput: true,
  });
  const {
    Credentials: { AccessKeyId: keyId, SecretAccessKey: otSecret, SessionToken: sessionToken },
  } = JSON.parse(String(credentials));
  return {
    id: keyId,
    secret: otSecret,
    sessionToken,
  };
}

function processParams(params) {
  const { serviceNameInput, accountAliasInput } = determineInput(params);
  const serviceName = serviceNameInput || getMandatoryEnvValue('IAC_DEFAULT_SERVICE_NAME');
  const accountAlias = accountAliasInput || getMandatoryEnvValue('IAC_DEFAULT_ACCOUNT_ALIAS');
  return {
    serviceName,
    accountAlias,
  };
}

function determineInput(params) {
  const [paramOne, paramTwo] = params || [];
  const allowedAccountAliases = parseCsv(getMandatoryEnvValue('IAC_ALLOWED_ACCOUNT_ALIASES'));
  if (!paramOne) {
    return {};
  }
  if (paramTwo) {
    return {
      serviceNameInput: paramOne,
      accountAliasInput: paramTwo,
    };
  }
  if (allowedAccountAliases.includes(paramOne)) {
    return {
      accountAliasInput: paramOne,
    };
  }
  return {
    serviceNameInput: paramOne,
  };
}
