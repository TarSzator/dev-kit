import chalk from 'chalk';

/* eslint no-console:0 */

let log = createLog();

function createLog(debug = false) {
  const defaultLog = {
    debug() {},
    info(name, ...args) {
      console.info(chalk.green(`[${name}][info]`), ...args);
    },
    notice(name, ...args) {
      console.info(chalk.blue(`[${name}][notice]`), ...args);
    },
    warn(name, ...args) {
      console.warn(chalk.yellow(`[${name}][warn]`), ...args);
    },
    error(name, ...args) {
      console.error(chalk.red(`[${name}][error]`), ...args);
    },
  };
  if (!debug) {
    return defaultLog;
  }
  return {
    ...defaultLog,
    debug(name, ...args) {
      console.debug(chalk.cyan(`[${name}][debug]`), ...args);
    },
  };
}

export function enableDebug() {
  log = createLog(true);
}

export function getLog(name) {
  return {
    debug(...args) {
      log.debug(name, ...args);
    },
    info(...args) {
      log.info(name, ...args);
    },
    notice(...args) {
      log.notice(name, ...args);
    },
    warn(...args) {
      log.warn(name, ...args);
    },
    error(...args) {
      log.error(name, ...args);
    },
  };
}
