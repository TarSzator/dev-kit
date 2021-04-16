import { exec } from 'child_process';
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
