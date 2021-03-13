import BaseError from './BaseError.js';
import { ERROR_UNKNOWN_ERROR } from './errorCodes.js';

export default class UnknownError extends BaseError {
  constructor(id, message, additionalInformation = null, parentError = null) {
    super(ERROR_UNKNOWN_ERROR, id, message, additionalInformation, parentError);
  }
}
