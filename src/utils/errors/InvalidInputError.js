import { ERROR_INVALID_INPUT } from './errorCodes.js';
import StacklessError from './StacklessError.js';

export default class InvalidInputError extends StacklessError {
  constructor(id, message, additionalInformation = null, parentError = null) {
    super(ERROR_INVALID_INPUT, id, message, additionalInformation, parentError);
  }
}
