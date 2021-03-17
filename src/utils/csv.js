export function parseCsv(str) {
  if (!str) {
    return [];
  }
  return String(str)
    .split(',')
    .map((s) => s.trim())
    .filter((s) => !!s);
}
