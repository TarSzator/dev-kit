import readline from 'readline';

export async function requestConfirmation({ query, defaultResult = 'Y', positiveResult = 'Y' }) {
  const response = await readLine({ query });
  const result = String(response || defaultResult).toUpperCase();
  return result === String(positiveResult).toUpperCase();
}

export async function readLine({ query }) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve, reject) => {
    try {
      rl.question(query, (response) => {
        try {
          rl.close();
          resolve(response);
        } catch (err) {
          reject(err);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}
