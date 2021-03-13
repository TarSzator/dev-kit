import StacklessError from './StacklessError.js';

export default class StacklessWarn extends StacklessError {
  constructor(code, id, message, additionalInformation = null, parentError = null) {
    super(code, id, message, additionalInformation, parentError);
    this.warn = true;
  }
}
