import { dockerPs } from './dockerPs.js';
import { getAllServices } from '../../../utils/services.js';
import { createSingleton } from '../../../utils/singleton.js';
import { getPwd } from '../../../utils/pwd.js';

export async function getServiceState({ serviceName, reset = false }) {
  if (reset) {
    resetState();
  }
  const states = await getDockerState();
  return states.get(serviceName) || {};
}

export const getDockerState = createSingleton(retrieveDockerState);

export function resetState() {
  getDockerState.reset();
}

async function retrieveDockerState() {
  const pwd = await getPwd();
  const psResult = await dockerPs({ pwd });
  const lines = psResult
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => !!s);
  const serviceLines = lines.slice(2);
  if (!serviceLines.length) {
    return new Map();
  }
  const services = await getAllServices({ pwd });
  const stateByContainerName = serviceLines.reduce((m, line) => {
    const [containerName, , state] = line.split(/\s{2,}/);
    m.set(containerName, state);
    return m;
  }, new Map());
  return services.reduce((m, service) => {
    const { name, hasHealthcheck, containerName } = service;
    const stateValue = stateByContainerName.get(containerName);
    const isCreated = !!stateValue;
    const isUp = !!stateValue && stateValue.indexOf('Up') !== -1;
    const isHealthy = getHealthState({ isUp, hasHealthcheck, state: stateValue });
    const state = {
      service,
      isCreated,
      isHealthy,
      isUp,
    };
    m.set(name, state);
    return m;
  }, new Map());
}

function getHealthState({ isUp, hasHealthcheck, state }) {
  if (!state) {
    return false;
  }
  if (!isUp) {
    return false;
  }
  if (!hasHealthcheck) {
    return true;
  }
  return state.indexOf('healthy') !== -1;
}
