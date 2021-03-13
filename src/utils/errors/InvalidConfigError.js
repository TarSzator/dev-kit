import StacklessError from './StacklessError.js';
import { ERROR_INVALID_CONFIG } from './errorCodes.js';

export default class InvalidConfigError extends StacklessError {
  constructor(id, message, additionalInformation = null, parentError = null) {
    super(ERROR_INVALID_CONFIG, id, message, additionalInformation, parentError);
  }
}
