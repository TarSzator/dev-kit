import { resolve } from 'path';
import actions from '../actions/index.js';
import { exists } from './fs.js';
import { isEmpty, isFunction, isNonEmptyString, isPlainObject } from './validators.js';
import { EnvironmentError } from './errors/index.js';

export async function getActions({ pwd }) {
  const externalActions = await getExternalActions({ pwd, actionKeys: Object.keys(actions) });
  if (!isEmpty(externalActions)) {
    return {
      ...externalActions,
      ...actions,
    };
  }
  return {
    ...actions,
  };
}

async function getExternalActions({ pwd, actionKeys }) {
  const additionalActionsPath = resolve(pwd, './actions/index.js');
  if (!(await exists(additionalActionsPath))) {
    return {};
  }
  const { default: additionalActions } = await import(additionalActionsPath);
  if (!isPlainObject(additionalActions)) {
    throw new EnvironmentError(
      1615915830,
      `Additional actions file is in project but does not export an plain object as default`
    );
  }
  Object.entries(additionalActions).forEach(
    ([actionKey, { exec, description, paramsDesc, ...rest }]) => {
      if (actionKeys.includes(actionKey)) {
        throw new EnvironmentError(
          1615963863,
          `External action "${actionKey}" can't be used because there is a standard action with the same key.`
        );
      }
      if (!isFunction(exec)) {
        throw new EnvironmentError(
          1615964039,
          `External action "${actionKey}" must provide an exec function.`
        );
      }
      if (!isNonEmptyString(description)) {
        throw new EnvironmentError(
          1615964071,
          `External action "${actionKey}" must provide a description string.`
        );
      }
      if (paramsDesc && !isNonEmptyString(paramsDesc)) {
        throw new EnvironmentError(
          1615964091,
          `External action "${actionKey}"'s paramsDesc must be a string if provided.`
        );
      }
      if (!isEmpty(rest)) {
        throw new EnvironmentError(
          1615964137,
          `External action "${actionKey}" provides more configuration properties then required.`
        );
      }
    }
  );
  return additionalActions;
}
