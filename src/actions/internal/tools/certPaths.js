import { InvalidConfigError } from '../../../utils/errors';
import { FOLDER_NAMES } from '../../../consts';

export function getCertPath() {
  const { SSL_CERT_PREFIX } = process.env;
  if (!SSL_CERT_PREFIX) {
    throw new InvalidConfigError(1615829181, `SSL_CERT_PREFIX not configured in environment`);
  }
  return {
    certPath: `${FOLDER_NAMES.CERT}/${SSL_CERT_PREFIX}-local.crt`,
    certKeyPath: `${FOLDER_NAMES.CERT}/${SSL_CERT_PREFIX}-local.key`,
  };
}
