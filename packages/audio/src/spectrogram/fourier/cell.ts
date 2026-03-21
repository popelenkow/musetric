import {
  createResourceCell,
  type ResourceCell,
} from '@musetric/resource-utils';
import { type ComplexGpuBuffer } from '../common/complexArray.js';
import { type ExtSpectrogramConfig } from '../common/extConfig.js';
import { fouriers } from './fouriers.js';
import {
  type Fourier,
  type FourierArg,
  type FourierTimestampWrites,
} from './types.js';

export type Config = Pick<
  ExtSpectrogramConfig,
  'fourierMode' | 'windowSize' | 'windowCount' | 'zeroPaddingFactor'
>;

export type StateArg = {
  signal: ComplexGpuBuffer;
  config: Config;
};

export const createFourierCell = (
  device: GPUDevice,
  markers?: FourierTimestampWrites,
): ResourceCell<StateArg, Fourier> => {
  const modeCell = createResourceCell({
    create: (mode: Config['fourierMode']) => fouriers[mode](device, markers),
    dispose: (cell) => {
      cell.dispose();
    },
    equals: (current, next) => current === next,
  });

  return {
    get: (arg) => {
      const { signal, config } = arg;
      const fourier = modeCell.get(config.fourierMode);
      const fourierArg: FourierArg = {
        signal,
        config: {
          windowSize: config.windowSize * config.zeroPaddingFactor,
          windowCount: config.windowCount,
        },
      };

      return fourier.get(fourierArg);
    },
    dispose: () => {
      modeCell.dispose();
    },
  };
};
