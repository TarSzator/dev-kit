import minimist from 'minimist';

export function getOptions() {
  const { _: [action, service, targetService] = [] } = minimist(process.argv.slice(2));
  return {
    action,
    service,
    targetService,
  };
}
