#!/usr/bin/env node

// eslint-disable-next-line import/no-unresolved,import/no-extraneous-dependencies
import { processAction } from '@rene.simon/dev-kit';

/* eslint no-console:0 */

function exit(code) {
  setTimeout(() => {
    process.exit(code);
  }, 500);
}
processAction()
  .then((code) => {
    if (typeof code !== 'number' || code < 0) {
      throw new Error(`Invalid exit code provided by dev kit response`);
    }
    exit(code);
  })
  .catch((error) => {
    console.error(error);
    exit(1);
  });
