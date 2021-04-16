import { isFunction } from './validators.js';
import { UnknownError } from './errors/index.js';

export function waterfall(generators, startValue) {
  return generators.reduce((p, generate) => {
    if (!isFunction(generate)) {
      throw new UnknownError(1616011631, `All generators must be functions in waterfall`);
    }
    return p.then((v) => generate(v));
  }, Promise.resolve(startValue));
}

export async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
