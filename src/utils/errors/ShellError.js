import StacklessError from './StacklessError.js';
import { ERROR_SHELL_ERROR } from './errorCodes.js';

export default class ShellError extends StacklessError {
  constructor(id, message, additionalInformation = null, parentError = null) {
    super(ERROR_SHELL_ERROR, id, message, additionalInformation, parentError);
  }
}
