import StacklessError from './StacklessError.js';
import { ERROR_ENVIRONMENT_ERROR } from './errorCodes.js';

export default class EnvironmentError extends StacklessError {
  constructor(id, message, additionalInformation = null, parentError = null) {
    super(ERROR_ENVIRONMENT_ERROR, id, message, additionalInformation, parentError);
  }
}
