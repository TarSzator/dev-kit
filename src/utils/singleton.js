import { isFunction, isPositiveInteger } from './validators.js';
import { InternalError } from './errors/index.js';

const notInitiated = Symbol('notInitiated');

export function createSingleton({
  construct,
  initResult = notInitiated,
  resetAfterDone = false,
  resetAfterMs = undefined,
} = {}) {
  if (!isFunction(construct)) {
    throw new InternalError(1647193742, 'Singleton construct function must be a function');
  }
  if (resetAfterMs !== undefined && !isPositiveInteger(resetAfterMs)) {
    throw new InternalError(1659022461, 'If set resetAfterMs it must be a positive integer');
  }
  let result = initResult === notInitiated ? notInitiated : Promise.resolve(initResult);
  let success = false;
  let timeoutId = null;
  const singleton = (key) => {
    if (result === notInitiated) {
      result = construct(key);
      if (result instanceof Promise) {
        result
          .then(() => {
            success = true;
            if (resetAfterDone) {
              result = notInitiated;
            } else if (resetAfterMs) {
              timeoutId = setTimeout(() => {
                timeoutId = null;
                result = notInitiated;
              }, resetAfterMs);
            }
          })
          .catch(() => {
            result = notInitiated;
            success = false;
          });
      } else {
        success = true;
      }
    }
    return result;
  };
  singleton.reset = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    result = notInitiated;
    success = false;
  };
  singleton.isInitialized = () => result !== notInitiated;
  singleton.executionSuccessful = () => success;
  singleton.inProgress = () => singleton.isInitialized() && !singleton.executionSuccessful();
  return singleton;
}

export function createSingletonMap({
  construct,
  resetAfterDone = false,
  resetAfterMs = undefined,
}) {
  const singletons = new Map();
  const singletonMap = (key) => {
    if (!singletons.has(key)) {
      singletons.set(key, createSingleton({ construct, resetAfterDone, resetAfterMs }));
    }
    const s = singletons.get(key);
    return s(key);
  };
  singletonMap.reset = (key) => {
    const s = singletons.get(key);
    if (s) {
      s.reset();
    }
  };
  return singletonMap;
}
