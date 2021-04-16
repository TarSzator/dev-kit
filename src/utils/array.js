export function getInvalidValues(values, validValues) {
  if (!validValues) {
    return [];
  }
  return values.filter((v) => !validValues.includes(v));
}
