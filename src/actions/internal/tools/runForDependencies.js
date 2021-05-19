import { waterfall } from '../../../utils/promise.js';

export async function runForDependencies({ dependencies, runner, initValue }) {
  return waterfall(
    dependencies.map(
      (services) => async (x) =>
        waterfall(
          services.map((s) => async (y) => runner(s, y)),
          x
        )
    ),
    initValue
  );
}
