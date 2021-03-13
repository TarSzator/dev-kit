import { ERROR_SKIPPED } from './errorCodes.js';
import StacklessWarn from './StacklessWarn.js';

export default class SkippedError extends StacklessWarn {
  constructor(id, message, additionalInformation = null, parentError = null) {
    super(ERROR_SKIPPED, id, message, additionalInformation, parentError);
  }
}
