import { getLog } from '../../utils/log.js';
import { executeSpawn } from '../../utils/execute.js';
import { fetchMfaCredentials } from '../internal/tools/fetchMfaCredentials.js';

const log = getLog('openIaC');

export async function openIaC({ pwd, params }) {
  const {
    id: loginId,
    secret: loginSecret,
    sessionToken,
    region,
    serviceName,
    accountAlias,
  } = await fetchMfaCredentials({ pwd, params, internalParams: { keepServiceRunning: true } });
  log.info(`Login to "${serviceName}" with account "${accountAlias}" ...`);
  const command =
    `docker-compose exec ` +
    `-e AWS_ACCOUNT_ALIAS=${accountAlias} ` +
    `-e AWS_ACCESS_KEY_ID=${loginId} ` +
    `-e AWS_SECRET_ACCESS_KEY=${loginSecret} ` +
    `-e AWS_SESSION_TOKEN=${sessionToken} ` +
    `-e AWS_DEFAULT_REGION=${region} ` +
    `${serviceName} /bin/sh`;
  await executeSpawn({ pwd, command, log });
}
