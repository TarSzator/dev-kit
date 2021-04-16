import { restart } from './restart.js';

const serviceName = 'proxy';

export async function debugProxy({ pwd }) {
  await restart({ pwd, params: [serviceName] });
}
