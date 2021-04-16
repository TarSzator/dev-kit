import { setup } from './setup.js';
import { install } from './install.js';
import { downAll } from './downAll.js';
import { terminate } from './terminate.js';
import { link } from './link.js';
import { pull } from './pull.js';
import { resetCert } from './resetCert.js';
import { purge } from './purge.js';
import { ps } from './ps.js';
import { login } from './login.js';
import { logs } from './logs.js';
import { tail } from './tail.js';
import { build } from './build.js';
import { hardUpdate } from './hardUpdate.js';
import { up } from './up.js';
import { down } from './down.js';

export default {
  setup: {
    exec: setup,
    description: 'Setup local development environment with all connected projects',
  },
  terminate: {
    exec: terminate,
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
  link: {
    exec: link,
    description: `Links a node module to a project. Replaces npm link for docker`,
    paramsDesc: '<source> <target>',
  },
  pull: {
    exec: pull,
    description: `Pull the newest version of not internal containers`,
  },
  resetCert: {
    exec: resetCert,
    description: `Resetting the certificate if there are any issues`,
  },
  purge: {
    exec: purge,
    description: `Purges docker from everything related to this dev kit`,
  },
  ps: {
    exec: ps,
    description: `Shows docker process list for this project`,
  },
  login: {
    exec: login,
    description: `SSH login to service`,
    paramsDesc: '<service>',
  },
  logs: {
    exec: logs,
    description: `Show logs for a specific service`,
    paramsDesc: '<service>',
  },
  tail: {
    exec: tail,
    description: `Tails logs for a specific service`,
    paramsDesc: '<service>',
  },
  build: {
    exec: build,
    description: `Executes the build script for the specified service`,
    paramsDesc: '<service>',
  },
  hardUpdate: {
    exec: hardUpdate,
    description: `Executes the hardUpdate script for the specified service`,
    paramsDesc: '<service>',
  },
  up: {
    exec: up,
    description: `Starts the specified service and its requirements`,
    paramsDesc: '<service>',
  },
  down: {
    exec: down,
    description: `Stops the specified service and it's requirements that are no longer needed`,
    paramsDesc: '<service>',
  },
};
