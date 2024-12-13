import { dockerPs } from './dockerPs.js';
import { getAllServices } from '../../../utils/services.js';
import { createSingleton } from '../../../utils/singleton.js';
import { getPwd } from '../../../utils/pwd.js';
import { EnvironmentError } from '../../../utils/errors/index.js';

const UP = /(Up|Running)/i;

export async function getServiceState({ serviceName, reset = false }) {
  if (reset) {
    resetState();
  }
  const states = await getDockerState();
  return states.get(serviceName) || {};
}

export const getDockerState = createSingleton({ construct: retrieveDockerState });

export function resetState() {
  getDockerState.reset();
}

async function retrieveDockerState() {
  const pwd = await getPwd();
  const lines = await getPsLines({ pwd });
  if (!lines.length) {
    return new Map();
  }
  const { serviceNameIndex, statusIndex, serviceLines } = processPsLines(lines);
  if (!serviceLines.length) {
    return new Map();
  }
  const services = await getAllServices({ pwd });
  const stateByContainerName = serviceLines.reduce((m, line) => {
    const elements = splitPsLine(line);
    const containerName = elements[serviceNameIndex];
    const state = elements[statusIndex];
    m.set(containerName, state);
    return m;
  }, new Map());
  return services.reduce((m, service) => {
    const { name, hasHealthcheck, containerName } = service;
    const stateValue = stateByContainerName.get(containerName) || stateByContainerName.get(name);
    const isCreated = !!stateValue;
    const isUp = determineUpState(stateValue);
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

async function getPsLines({ pwd }) {
  try {
    const psResult = await dockerPs({ pwd });
    return psResult
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => !!s);
  } catch (error) {
    const { code, stderr } = error.additionalInformation || {};
    if (code !== 1) {
      throw error;
    }
    if (stderr.includes('not found')) {
      return [];
    }
    throw error;
  }
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

function processPsLines(psLines) {
  if (!psLines.length) {
    return [];
  }
  const [val] = psLines;
  if (!val) {
    return processPsLines(psLines.slice(1));
  }
  const [header] = psLines;
  const headerParts = splitPsLine(header).map((s) => s.toUpperCase());
  const serviceNameIndex = determineServiceNameIndex(headerParts);
  if (serviceNameIndex === -1) {
    throw new EnvironmentError(
      1626858423,
      `Could not determine container name column in "docker compose ps" response. Please create an issue to inform the developer.`,
      { header }
    );
  }
  const statusColumnIndex = headerParts.indexOf('STATUS');
  const stateColumnIndex = headerParts.indexOf('STATE');
  const statusIndex = statusColumnIndex === -1 ? stateColumnIndex : statusColumnIndex;
  if (statusIndex === -1) {
    throw new EnvironmentError(
      1626858514,
      `Could not determine status column in "docker compose ps" response. Please create an issue to inform the developer.`,
      { header }
    );
  }
  const serviceLines = psLines.slice(1);
  return {
    serviceNameIndex,
    statusIndex,
    serviceLines,
  };
}

function determineServiceNameIndex(headerParts) {
  const index = headerParts.indexOf('NAME');
  if (index !== -1) {
    return index;
  }
  return headerParts.indexOf('SERVICE');
}

function splitPsLine(line) {
  return line.split(/\s{2,}/);
}

function determineUpState(state) {
  if (!state) {
    return false;
  }
  return UP.test(state);
}
