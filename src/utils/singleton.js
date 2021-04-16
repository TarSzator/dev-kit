export function createSingleton(creator) {
  let singleton = null;
  const create = async () => creator();
  const exec = async () => {
    if (!singleton) {
      singleton = create();
      singleton.catch(() => {
        // [RS] Errors are handled where the function is called
        singleton = null;
      });
    }
    return singleton;
  };
  exec.reset = () => {
    singleton = null;
  };
  return exec;
}
