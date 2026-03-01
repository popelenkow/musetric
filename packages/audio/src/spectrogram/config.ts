import { type ViewColors } from '../common/colors.js';
import { type ViewSize } from '../common/viewSize.js';
import { type WindowName } from './windowFunction.js';

export type ZeroPaddingFactor = 1 | 2 | 4;

export type PipelineConfig = {
  windowSize: number;
  sampleRate: number;
  visibleTimeBefore: number;
  visibleTimeAfter: number;
  zeroPaddingFactor: ZeroPaddingFactor;
  windowName: WindowName;
  minDecibel: number;
  minFrequency: number;
  maxFrequency: number;
  viewSize: ViewSize;
  colors: ViewColors;
};

export type ExtPipelineConfig = PipelineConfig & {
  windowCount: number;
};

export const applyPatchConfig = (
  draftConfig: Partial<PipelineConfig>,
  patchConfig: Partial<PipelineConfig>,
  config: PipelineConfig,
) => {
  type Entry =
    | {
        key: keyof PipelineConfig;
        value: undefined;
      }
    | {
        [Key in keyof PipelineConfig]: {
          key: Key;
          value: PipelineConfig[Key];
        };
      }[keyof PipelineConfig];
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
