import type { SpectrogramConfig } from '../config.es.js';

export type ExtSpectrogramConfig = SpectrogramConfig & {
  windowCount: number;
};

export const applySpectrogramPatchConfig = (
  draftConfig: Partial<SpectrogramConfig>,
  patchConfig: Partial<SpectrogramConfig>,
  config: SpectrogramConfig,
) => {
  type Entry =
    | {
        key: keyof SpectrogramConfig;
        value: undefined;
      }
    | {
        [Key in keyof SpectrogramConfig]: {
          key: Key;
          value: SpectrogramConfig[Key];
        };
      }[keyof SpectrogramConfig];
  type RunCallback = (entry: Entry) => void;
  const run = (callback: RunCallback) => {
    Object.entries(patchConfig).forEach((entry) => {
      const [key, value] = entry;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      callback({ key, value } as Entry);
    });
  };
  const result = { ...draftConfig };
  run((entry) => {
    if (entry.value === undefined) {
      return;
    }
    if (entry.value === config[entry.key]) {
      delete result[entry.key];
      return;
    }
    if (entry.key === 'viewSize') {
      if (
        entry.value.width === config.viewSize.width &&
        entry.value.height === config.viewSize.height
      ) {
        delete result.viewSize;
        return;
      }
    }
    if (entry.key === 'colors') {
      if (
        entry.value.background === config.colors.background &&
        entry.value.played === config.colors.played &&
        entry.value.unplayed === config.colors.unplayed
      ) {
        delete result.colors;
        return;
      }
    }
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    result[entry.key] = entry.value as any;
  });
  return result;
};
