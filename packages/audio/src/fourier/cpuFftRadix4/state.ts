import { type FourierConfig } from '../config.js';
import { assertWindowSizePowerOfTwo } from '../isPowerOfTwo.js';
import { utilsRadix4 } from '../utilsRadix4.js';

export type State = {
  config: FourierConfig;
  reverseWidth: number;
  reverseTable: Uint32Array<ArrayBuffer>;
  trigTable: Float32Array<ArrayBuffer>;
  configure: (config: FourierConfig) => void;
};
export const createState = (): State => {
  const ref: State = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    config: undefined!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    reverseWidth: undefined!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    reverseTable: undefined!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    trigTable: undefined!,
    configure: (config) => {
      const { windowSize } = config;
      assertWindowSizePowerOfTwo(windowSize);
      ref.config = config;
      ref.reverseWidth = utilsRadix4.getReverseWidth(windowSize);
      ref.reverseTable = utilsRadix4.createReverseTable(ref.reverseWidth);
      ref.trigTable = utilsRadix4.createTrigTable(windowSize);
    },
  };
  return ref;
};
