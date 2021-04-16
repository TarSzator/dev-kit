import { getService } from '../../../utils/services.js';
import { getDockerState } from './dockerState.js';
import { getLog } from '../../../utils/log.js';
import { stopService } from './stopService.js';

const log = getLog('stopServiceIfNotNeeded');

export async function stopServiceIfNotNeeded({
  pwd,
  params: [serviceName, ignoredServiceNames] = [],
}) {
  const { name } = await getService({ serviceName, pwd });
  const dockerState = await getDockerState();
  const servicesDependingInThisService = [...dockerState.values()].find((state) =>
    needsService({ serviceName: name, ignoredServiceNames, state })
  );
  if (servicesDependingInThisService) {
    const {
      service: { name: dependentServiceName },
    } = servicesDependingInThisService;
    log.notice(
      `Will not stop service "${name}" because it is still required by "${dependentServiceName}".`
    );
    return;
  }
  await stopService({ pwd, params: [name] });
}

function needsService({
  serviceName,
  ignoredServiceNames,
  state: {
    service: { name: stateServiceName, dependencies },
    isCreated,
  },
}) {
  if (!isCreated) {
    return false;
  }
  if (!dependencies.includes(serviceName)) {
    return false;
  }
  return !ignoredServiceNames.includes(stateServiceName);
}
