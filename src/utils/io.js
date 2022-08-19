import { basename } from 'path';
import readline from 'readline';
import chalk from 'chalk';
import clui from 'clui';

const { Line } = clui;

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
    `${chalk.green('Usage:')} ${basename(process.argv[1])} ACTION [ARGUMENTS]\n\n` +
      `Control script\n\n` +
      `${chalk.green('Actions:')}`
  );
  const sortedExtendedActions = [
    ...Object.entries(actions),
    ['help', { description: 'Shows this usage instructions.' }],
  ].sort(([actionA], [actionB]) => actionA.localeCompare(actionB));
  const helpTableSet = sortedExtendedActions.reduce(
    (s, [action, { description, paramsDesc, optionsDesc }]) => {
      s.add([`${action}${paramsDesc ? ` ${paramsDesc}` : ''}  `, description]);
      if (optionsDesc) {
        s.add(['', 'Options:']);
        Object.entries(optionsDesc).forEach(([option, optionDesc]) => {
          s.add(['', `${option} ${optionDesc}`]);
        });
      }
      return s;
    },
    new Set()
  );
  printTable([...helpTableSet]);
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

export function highlight(str) {
  return chalk.cyan(str);
}
