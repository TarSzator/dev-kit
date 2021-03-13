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
    if (!message) {
      message = `No error message provided to construct BaseError`;
    }
    if (message instanceof Error) {
      parentError = message;
      message = parentError.message || `Parent error without message provided`;
    }
    super(message);
    this.id = id;
    this.code = code || ERROR_UNKNOWN_ERROR;
    this.additionalInformation = additionalInformation;
    this.parentError = parentError;
    Error.captureStackTrace(this, BaseError);
  }
}
