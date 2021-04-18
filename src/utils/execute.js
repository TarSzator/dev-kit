import { exec, spawn } from 'child_process';
import { ShellError, UnknownError } from './errors/index.js';

export async function execute({ command, pwd }) {
  return new Promise((resolve, reject) => {
    try {
      exec(
        command,
        {
          cwd: pwd,
          env: process.env,
          encoding: 'utf8',
          shell: '/bin/zsh',
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

export async function executeSpawn({ command, pwd, log }) {
  log.info(command);
  return new Promise((resolve, reject) => {
    let callbackExecuted = false;
    const callback = (error) => {
      if (callbackExecuted) {
        return;
      }
      callbackExecuted = true;
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    };
    try {
      const args = command.split(' ');
      const [com] = args.splice(0, 1);
      const childProcess = spawn(com, args, {
        cwd: pwd,
        env: process.env,
        stdio: 'inherit',
      });
      childProcess.on('error', (error) => {
        callback(error);
      });
      childProcess.on('close', (code) => {
        if (code) {
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
