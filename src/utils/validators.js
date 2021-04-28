import _ from 'lodash';

export function isNumber(val) {
  return _.isNumber(val) && !_.isNaN(val);
}

export function isInteger(val) {
  return _.isInteger(val);
}

export function isPositiveInteger(val) {
  return _.isInteger(val) && val > 0;
}

export function isString(val) {
  return _.isString(val);
}

export function isEmpty(val) {
  if (isNumber(val)) {
    return !val;
  }
  return _.isEmpty(val);
}

export function isNonEmptyString(val) {
  return isString(val) && !isEmpty(val.trim());
}

export function isPlainObject(val) {
  return _.isPlainObject(val);
}

export function isFunction(val) {
  return _.isFunction(val);
}

export function hasProperty(obj, propertyName) {
  return Object.hasOwnProperty.call(obj, propertyName);
}

export function endWith(str, needle) {
  return _.endsWith(str, needle);
}
