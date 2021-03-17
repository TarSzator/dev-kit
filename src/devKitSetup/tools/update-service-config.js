import { LABELS } from '../../consts/index.js';
import { hasProperty, isEmpty, isNonEmptyString } from '../../utils/validators.js';
import { parseCsv } from '../../utils/csv.js';
import { getInvalidValues } from '../../utils/array.js';
import { getLog } from '../../utils/log.js';
import { waterfall } from '../../utils/promise.js';
import { InternalError } from '../../utils/errors/index.js';
import { readLine } from '../../utils/io.js';
import InvalidInputError from '../../utils/errors/InvalidInputError.js';

const MANDATORY_LABELS = Object.values(LABELS).filter(({ MANDATORY }) => MANDATORY);

const log = getLog('updateServiceConfig');

const REMOVE_VALUE = 'REMOVE';

export async function updateServiceConfig({ serviceName, serviceConfigs }) {
  const serviceConfig = serviceConfigs[serviceName];
  if (!serviceConfig) {
    throw new InternalError(
      1616006590,
      `Could not find service "${serviceName}" in provided serviceConfigs. Something went wrong.`
    );
  }
  const serviceNames = Object.keys(serviceConfigs);
  log.info(`... checking service "${serviceName}" ...`);
  const { labels } = serviceConfig || {};
  const missingLabels = getMissingMandatoryLabels({ labels });
  if (isEmpty(missingLabels)) {
    log.info(
      `... mandatory config for service "${serviceName}" is valid. No further config needed ...`
    );
    // [RS] I am doing this so the behaviour of "copy" is the same for all return values
    return { changed: false, config: { ...serviceConfig, labels: { ...labels } } };
  }
  log.notice(`... some mandatory config for service "${serviceName}" is missing ...`);
  const newLabels = await waterfall(
    Object.values(LABELS).map((label) => async (changed) => {
      const { KEY: labelKey, CSV: multiple, MANDATORY: mandatory } = label;
      const missingMandatory = missingLabels.includes(label);
      const currentValue = labels[labelKey];
      const possibleValues = getPossibleValues({ label, serviceNames });
      const labelValue = await getPreparedLabel({
        serviceName,
        labelKey,
        multiple,
        missingMandatory,
        possibleValues,
        currentValue,
        mandatory,
      });
      if (currentValue === labelValue) {
        return changed;
      }
      return {
        ...changed,
        ...(labelValue ? { [labelKey]: labelValue } : {}),
      };
    }),
    labels
  );
  return {
    changed: newLabels !== labels,
    config: {
      ...serviceConfig,
      labels: {
        ...newLabels,
      },
    },
  };
}

function getMissingMandatoryLabels({ labels }) {
  if (!labels || isEmpty(labels)) {
    return [...MANDATORY_LABELS];
  }
  return MANDATORY_LABELS.filter(({ KEY, CSV, ENUM }) => {
    if (!hasProperty(labels, KEY)) {
      return true;
    }
    const value = labels[KEY];
    if (!isNonEmptyString(value)) {
      return true;
    }
    if (!ENUM) {
      return false;
    }
    const entries = CSV ? parseCsv(value) : [value];
    const invalidEntries = getInvalidValues(entries, Object.values(ENUM));
    return !isEmpty(invalidEntries);
  });
}

function getPossibleValues({ label, serviceNames }) {
  switch (label) {
    case LABELS.TYPES:
      return Object.values(LABELS.TYPES.ENUM);
    case LABELS.DEPENDENCIES:
      return serviceNames;
    default:
      throw new InternalError(
        1616006417,
        `No possible value handling for label key "${label.KEY}"`
      );
  }
}

async function getPreparedLabel({
  serviceName,
  labelKey,
  multiple,
  missingMandatory,
  possibleValues,
  currentValue,
  mandatory,
}) {
  try {
    const query =
      `Set value for "${labelKey}" for service "${serviceName}"` +
      `${missingMandatory ? `\n[Is missing mandatory value]` : ''}` +
      `\n[Current and default value: '${currentValue}' (just press enter)]` +
      `${possibleValues ? `\n[Possible values: '${possibleValues.join(`', '`)}']` : ''}` +
      `${multiple ? `\n[You can use multiple by separating them by comma (,)]` : ''}` +
      `${mandatory && !missingMandatory ? '\n[Is mandatory]' : ''}` +
      `${
        !mandatory
          ? `\n[If you want to remove the exiting value without replacing it, type ${REMOVE_VALUE}]`
          : ''
      }` +
      `:\n`;
    const value = (await readLine({ query })) || currentValue;
    if (value === REMOVE_VALUE) {
      if (mandatory) {
        throw new InvalidInputError(
          1616008453,
          `${REMOVE_VALUE} is not allowed for mandatory values`
        );
      }
      return undefined;
    }
    if (!value && !mandatory) {
      return undefined;
    }
    const entries = multiple ? parseCsv(value) : [value];
    const invalidEntries = getInvalidValues(entries, possibleValues);
    if (!isEmpty(invalidEntries)) {
      const valueLabel = multiple && entries.length > 1 ? 'values' : 'value';
      throw new InvalidInputError(
        1616008973,
        `Invalid ${valueLabel}: '${invalidEntries.join(`', '`)}'`
      );
    }
    return value;
  } catch (error) {
    if (error instanceof InvalidInputError) {
      log.error(`Invalid input: ${error.message}. Try again!`);
      return getPreparedLabel({
        serviceName,
        labelKey,
        multiple,
        missingMandatory,
        possibleValues,
        currentValue,
        mandatory,
      });
    }
    throw error;
  }
}
