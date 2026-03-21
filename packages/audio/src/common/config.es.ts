export const createConfigKeys =
  <T>() =>
  <const K extends readonly (keyof T)[]>(
    keys: Exclude<keyof T, K[number]> extends never ? K : never,
  ) =>
    keys;

export const extractConfig = <Config>(
  config: Partial<Config>,
  keys: readonly (keyof Config)[],
): Partial<Config> =>
  keys.reduce(
    (result, key) => {
      if (config[key] === undefined) {
        return result;
      }
      return { ...result, [key]: config[key] };
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    {} as Partial<Config>,
  );

export const isCompleteConfig = <Config>(
  config: Partial<Config>,
  keys: readonly (keyof Config)[],
): config is Config => keys.every((key) => config[key] !== undefined);
