import { exec, spawn, spawnSync } from 'child_process';
import { InvalidInputError, ShellError, UnknownError } from './errors/index.js';
import { isPlainObject, isTruthy } from './validators.js';
import { createSingletonMap } from './singleton.js';

const NON_ERROR_CODES = [130];

const getShell = createSingletonMap({
  construct: async (pwd) => {
    if (await checkCommand({ pwd, commandBin: 'zsh' })) {
      return '/bin/zsh';
    }
    if (await checkCommand({ pwd, commandBin: 'bash' })) {
      return '/bin/bash';
    }
    return '/bin/sh';
  },
});

export async function checkCommand({ pwd, commandBin, sudo = false } = {}) {
  const command = `${
    sudo ? 'sudo ' : ''
  }which ${commandBin} > /dev/null && echo 'true' || echo 'false'`;
  const checkResult = await execute({ command, pwd, shellOverwrite: '/bin/sh' });
  return isTruthy(checkResult);
}

export async function execute({
  command,
  pwd,
  environmentExtension = {},
  shellOverwrite = undefined,
} = {}) {
  if (!isPlainObject(environmentExtension)) {
    throw new InvalidInputError(
      1624951090,
      `environmentExtension must be a plain object when provided`
    );
  }
  const shell = shellOverwrite || (await getShell(pwd));
  return new Promise((resolve, reject) => {
    try {
      const env = { ...process.env, ...environmentExtension };
      exec(
        command,
        {
          cwd: pwd,
          env,
          encoding: 'utf8',
          shell,
        },
        (err, stdout, stderr) => {
          if (err) {
            reject(
              new ShellError(
                1615878302,
                `Command "${command}" failed`,
                {
                  code: err.code,
                  stderr,
                  stdout,
                  ...(err.code === 15 ? { env } : {}),
                },
                err
              )
            );
          } else {
            resolve(stdout);
          }
        }
      );
    } catch (error) {
      reject(new UnknownError(1615878385, `Child process execution failed`, null, error));
    }
  });
}

export async function executeSpawn({ command, pwd, log, environmentExtension = {} }) {
  if (!isPlainObject(environmentExtension)) {
    throw new InvalidInputError(
      1624951090,
      `environmentExtension must be a plain object when provided`
    );
  }
  log.info(command);
  return new Promise((resolve, reject) => {
    let callbackExecuted = false;
    const callback = (error, output) => {
      if (callbackExecuted) {
        return;
      }
      callbackExecuted = true;
      if (error) {
        reject(error);
      } else {
        resolve(output);
      }
    };
    try {
      const args = command.split(' ');
      const [com] = args.splice(0, 1);
      const childProcess = spawn(com, args, {
        cwd: pwd,
        env: { ...process.env, ...environmentExtension },
        stdio: 'inherit',
      });
      childProcess.on('error', (error) => {
        callback(error);
      });
      childProcess.on('close', (code) => {
        if (code && !NON_ERROR_CODES.includes(code)) {
          callback(
            new ShellError(1618762188, `Command "${command}" fail with error code "${code}"`)
          );
        } else {
          callback();
        }
      });
    } catch (error) {
      callback(new UnknownError(1618762250, `Child process spawned execution failed`, null, error));
    }
  });
}

export function executeSpawnSync({ command, pwd, log, environmentExtension = {} }) {
  if (!isPlainObject(environmentExtension)) {
    throw new InvalidInputError(
      1624951090,
      `environmentExtension must be a plain object when provided`
    );
  }
  log.info(command);
  const args = command.split(' ');
  const [com] = args.splice(0, 1);
  try {
    const {
      stdout: out,
      stderr: err,
      status: code,
      error,
    } = spawnSync(com, args, {
      cwd: pwd,
      env: { ...process.env, ...environmentExtension },
      stdio: ['inherit', 'pipe', 'pipe'],
      encoding: 'utf8',
    });
    if (error) {
      throw new UnknownError(1628760288, `Child process spawned execution failed`, null, error);
    }
    if (code && !NON_ERROR_CODES.includes(code)) {
      throw new ShellError(1628760335, `Command "${command}" fail with error code "${code}"`, {
        err,
        out,
      });
    }
    return out;
  } catch (caughtError) {
    throw new UnknownError(1628760143, `Child process spawned execution failed`, null, caughtError);
  }
}
