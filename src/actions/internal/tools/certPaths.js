import { join } from 'path';
import { InvalidConfigError } from '../../../utils/errors/index.js';
import { FOLDER_NAMES } from '../../../consts/index.js';

export function getCertPath({ pwd }) {
  const { SSL_CERT_PREFIX } = process.env;
  if (!SSL_CERT_PREFIX) {
    throw new InvalidConfigError(1615829181, `SSL_CERT_PREFIX not configured in environment`);
  }
  return {
    certPath: join(pwd, `${FOLDER_NAMES.CERT}/${SSL_CERT_PREFIX}-local.crt`),
    certKeyPath: join(pwd, `${FOLDER_NAMES.CERT}/${SSL_CERT_PREFIX}-local.key`),
  };
}
