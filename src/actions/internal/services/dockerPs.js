import { execute } from '../../../utils/execute.js';

export async function dockerPs({ pwd }) {
  return execute({ pwd, command: `docker-compose ps` });
}
