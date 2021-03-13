import BaseError from './BaseError.js';

export default class StacklessError extends BaseError {
  constructor(code, id, message, additionalInformation = null, parentError = null) {
    super(code, id, message, additionalInformation, parentError);
    this.stack = null;
  }

  toString() {
    return String(this.message) || 'Stackless Error without error message';
  }

  valueOf() {
    return this.toString();
  }
}
