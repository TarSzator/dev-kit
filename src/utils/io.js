import readline from 'readline';
import chalk from 'chalk';
import { Line } from 'clui';

export async function requestConfirmation({ query, defaultResult = 'Y', positiveResult = 'Y' }) {
  const response = await readLine({ query });
  const result = String(response || defaultResult).toUpperCase();
  return result === String(positiveResult).toUpperCase();
}

export async function readLine({ query }) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve, reject) => {
    try {
      rl.question(query, (response) => {
        try {
          rl.close();
          resolve(response);
        } catch (err) {
          reject(err);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function printHelp(actions) {
  // eslint-disable-next-line no-console
  console.log(
    `${chalk.green('Usage:')} ${process.argv0} ACTION [ARGUMENTS]\n\n` +
      `Control script\n\n` +
      `${chalk.green('Actions:')}`
  );
  printTable(
    Object.entries(actions).map(([action, { description, paramsDesc }]) => [
      `${action}${paramsDesc ? ` ${paramsDesc}` : ''}`,
      description,
    ])
  );
}

export function printTable(table, { padding = 2 } = {}) {
  const colWidths = getCollWidth(table);
  table.forEach((row) => {
    const line = new Line().padding(padding);
    row.forEach((cell, index) => {
      const width = colWidths[index];
      const isLast = index === row.length - 1;
      line.column(cell, isLast ? cell.length : width);
    });
    line.fill().output();
  });
}

function getCollWidth(table) {
  return table.reduce((lengths, row) => {
    row.forEach((cell, index) => {
      const { length } = String(cell);
      const maxLength = lengths[index] || 0;
      // eslint-disable-next-line no-param-reassign
      lengths[index] = length > maxLength ? length : maxLength;
    });
    return lengths;
  }, []);
}
