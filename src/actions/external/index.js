import { setup } from './setup.js';
import { install } from './install.js';
import { downAll } from './downAll.js';
import { purge } from './purge.js';

export default {
  setup: {
    exec: setup,
    description: 'Setup local development environment with all connected projects',
  },
  purge: {
    exec: purge,
    description: `Purges everything in context of this project`,
  },
  install: {
    exec: install,
    description: `Run 'npm install' in container so binaries are compiled for the right environment`,
    paramsDesc: '<service>',
  },
  downAll: {
    exec: downAll,
    description: `Stops all service`,
  },
};
