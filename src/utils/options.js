import minimist from 'minimist';

export function getCallInput() {
  const { _: [action, ...params] = [], ...options } = minimist(process.argv.slice(2));
  return {
    action,
    params,
    options,
  };
}
