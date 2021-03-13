import StacklessError from './StacklessError.js';
import { ERROR_INTERNAL_ERROR } from './errorCodes.js';

export default class InternalError extends StacklessError {
  constructor(id, message, additionalInformation = null, parentError = null) {
    super(ERROR_INTERNAL_ERROR, id, message, additionalInformation, parentError);
  }
}
