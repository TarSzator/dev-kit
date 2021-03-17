import dotenv from 'dotenv';
import { resolve } from 'path';
import { exists, hasReadAccess } from './fs.js';
import { InvalidConfigError } from './errors/index.js';
import { isNonEmptyString } from './validators.js';

export function getEnvPath({ path }) {
  return resolve(path, '.env');
}

export async function initEnv() {
  const path = getEnvPath({ path: process.cwd() });
  if (!(await exists(path))) {
    throw new InvalidConfigError(1614926805, `.env file does not exist at "${path}"`);
  }
  if (!(await hasReadAccess(path))) {
    throw new InvalidConfigError(1614926813, `No read rights on .env file at "${path}"`);
  }
  dotenv.config({ path });
}

export function getMandatoryEnvValue(key) {
  const { [key]: value } = process.env;
  if (!isNonEmptyString(value)) {
    throw new InvalidConfigError(1615877586, `Missing environment value for key "${key}"`);
  }
  return value;
}
