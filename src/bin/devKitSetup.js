#!/usr/bin/env node

import { setup } from '../devKitSetup/index.js';
import { InternalError } from '../utils/errors/index.js';

/* eslint no-console:0 */

function exit(code) {
  setTimeout(() => {
    process.exit(code);
  }, 500);
}
setup()
  .then((code) => {
    if (typeof code !== 'number' || code < 0) {
      throw new InternalError(1614926532, `Invalid exit code provided by setup action`);
    }
    exit(code);
  })
  .catch((error) => {
    console.error(error);
    exit(1);
  });
