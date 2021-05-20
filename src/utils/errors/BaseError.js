import { ERROR_UNKNOWN_ERROR } from './errorCodes.js';

/* eslint no-param-reassign:0 */

const INVALID_CHARS = /\W+/g;

export default class BaseError extends Error {
  constructor(code, id, message, additionalInformation = null, parentError = null) {
    if (!id) {
      id = 1590349004;
    }
    if (typeof id === 'string') {
      id = id.replace(INVALID_CHARS, '');
    }
    if (message instanceof Error) {
      parentError = message;
      message = parentError.message || `Parent error without message provided`;
    }
    super(message || `No error message provided to construct BaseError`);
    this.id = id;
    this.code = code || ERROR_UNKNOWN_ERROR;
    this.additionalInformation = message
      ? additionalInformation
      : { ...additionalInformation, stack: this.stack };
    this.parentError = parentError;
    Error.captureStackTrace(this, BaseError);
  }
}
