import {
  setup,
  install,
  downAll,
  terminate,
  link,
  pull,
  resetCert,
  purge,
  ps,
  login,
  logs,
  tail,
  build,
  hardUpdate,
  up,
  down,
  debugProxy,
  restart,
  open,
  unitTest,
  integrationTest,
  buildImage,
  exec,
  openIaC,
} from './export.js';
import { run } from './run.js';

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
    optionsDesc: {
      '--omitPeer <boolean>': 'Executes install while omitting peerDependencies',
      '--omitDev <boolean>': 'Executes install while omitting devDependencies',
      '--omitOptional <boolean>': 'Executes install while omitting optionalDependencies',
    },
  },
  downAll: {
    exec: downAll,
    description: `Stops all service`,
  },
  link: {
    exec: link,
    description: `Links a node module to a project. Replaces npm link for docker`,
    paramsDesc: '<source> <target>',
    optionsDesc: {
      '--skipRestart <boolean>': 'Skips the restart of the target after linking',
      '--forceOmittedInstall <boolean>':
        'Executes install on source while omitting peer and optional dependencies',
      '--forceDevOmit <boolean>': 'Also omitting dev dependencies on force omitted install',
    },
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
  exec: {
    exec,
    description: `Execute command on service`,
    paramsDesc: '<service> [<command>]',
  },
  login: {
    exec: login,
    description: `SSH login to service`,
    paramsDesc: '<service> [<shell>]',
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
  restart: {
    exec: restart,
    description: `Restarts the service and tails the log`,
    paramsDesc: '<service>',
    optionsDesc: {
      '--skipTail <boolean>': 'Skips the tailing of log after the restart',
    },
  },
  open: {
    exec: open,
    description: `Starts the service and opens the configured openUrl when healthy`,
    paramsDesc: '<service>',
  },
  debugProxy: {
    exec: debugProxy,
    description: `Restarts the proxy container and tails the log`,
  },
  unitTest: {
    exec: unitTest,
    description: `Runs "test" script for service`,
    paramsDesc: '<service>',
  },
  integrationTest: {
    exec: integrationTest,
    description: `Runs "test:integration" script for service`,
    paramsDesc: '<service>',
  },
  buildImage: {
    exec: buildImage,
    description: `Builds the docker image of the given service`,
    paramsDesc: '<service>',
    optionsDesc: {
      '--noCache': 'Disable the caching of the build steps',
      '--verbose': 'Verbose image build log',
    },
  },
  openIaC: {
    exec: openIaC,
    description: 'Starts and login to the IaC container',
    paramsDesc: '[<service>] [<accountAlias>]',
  },
  run: {
    exec: run,
    description: 'Runs a service with a specific command',
    paramsDesc: '<service> <runCommand>',
    optionsDesc: {
      '--env <envVarString>':
        '[Multiple allowed] (e.g.: --env NODE_ENV=production) Adds an environment variable to to the docker instance',
    },
  },
};
