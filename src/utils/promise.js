export function waterfall(generators, startValue) {
  return generators.reduce(
    (p, generate) => p.then((v) => generate(v)),
    Promise.resolve(startValue)
  );
}
