import type { ExtSpectrogramConfig } from './common/extConfig.js';
import { applySpectrogramPatchConfig } from './common/patchConfig.js';
import { type SpectrogramMarkers } from './common/processorTimer.js';
import {
  buildSpectrogramConfig,
  type FourierMode,
  type SpectrogramConfig,
} from './config.cross.js';
import {
  createSpectrogramDecibelifyCell,
  type SpectrogramDecibelify,
} from './decibelify/index.js';
import {
  createSpectrogramDrawCell,
  type SpectrogramDraw,
} from './draw/index.js';
import { fouriers } from './fourier/fouriers.js';
import type { Fourier } from './fourier/types.js';
import {
  createSpectrogramMagnitudifyCell,
  type SpectrogramMagnitudify,
} from './magnitudify/index.js';
import {
  createSpectrogramRemapCell,
  type SpectrogramRemap,
} from './remap/index.js';
import {
  createSpectrogramSliceWaveCell,
  type SpectrogramSliceWave,
} from './sliceWave/index.js';
import {
  createSpectrogramStateCell,
  type SpectrogramState,
} from './state/index.js';
import {
  createSpectrogramWindowingCell,
  type SpectrogramWindowing,
} from './windowing/index.js';

export type SpectrogramRuntime = {
  state: SpectrogramState;
  sliceWave: SpectrogramSliceWave;
  windowing: SpectrogramWindowing;
  fourier: Fourier;
  magnitudify: SpectrogramMagnitudify;
  decibelify: SpectrogramDecibelify;
  remap: SpectrogramRemap;
  draw: SpectrogramDraw;
};

export type SpectrogramConfigurator = {
  configure: () => SpectrogramRuntime;
  updateConfig: (config: Partial<SpectrogramConfig>) => void;
  dispose: () => void;
};

export type CreateSpectrogramConfiguratorOptions = {
  device: GPUDevice;
  fourierMode: FourierMode;
  markers: SpectrogramMarkers;
};

export const createSpectrogramConfigurator = (
  options: CreateSpectrogramConfiguratorOptions,
): SpectrogramConfigurator => {
  const { device, fourierMode, markers } = options;

  let draftConfig: Partial<SpectrogramConfig> = {};
  let config: ExtSpectrogramConfig | undefined = undefined;
  let runtime: SpectrogramRuntime | undefined = undefined;

  const cells = {
    state: createSpectrogramStateCell(device),
    sliceWave: createSpectrogramSliceWaveCell(device, markers.sliceWave),
    windowing: createSpectrogramWindowingCell(device, markers.windowing),
    fourier: fouriers[fourierMode](device, {
      reverse: markers.fourierReverse,
      transform: markers.fourierTransform,
    }),
    magnitudify: createSpectrogramMagnitudifyCell(device, markers.magnitudify),
    decibelify: createSpectrogramDecibelifyCell(device, markers.decibelify),
    remap: createSpectrogramRemapCell(device, markers.remap),
    draw: createSpectrogramDrawCell(device, markers.draw),
  };

  const buildConfig = (): ExtSpectrogramConfig => {
    const baseConfig = buildSpectrogramConfig(config, draftConfig);
    if (!baseConfig) {
      throw new Error('Incomplete spectrogram config');
    }
    draftConfig = {};
    return {
      ...baseConfig,
      windowCount: baseConfig.viewSize.width,
    };
  };

  return {
    configure: markers.configure(() => {
      if (!Object.keys(draftConfig).length) {
        if (!runtime) {
          throw new Error('No spectrogram config available');
        }
        return runtime;
      }

      config = buildConfig();
      draftConfig = {};
      const state = cells.state.get(config);
      const { signal, texture } = state;
      const sliceWave = cells.sliceWave.get({ out: signal.real, config });
      const windowing = cells.windowing.get({ signal: signal.real, config });
      cells.fourier.configure(signal, {
        ...config,
        windowSize: config.windowSize * config.zeroPaddingFactor,
      });
      const magnitudify = cells.magnitudify.get({ signal, config });
      const decibelify = cells.decibelify.get({ signal: signal.real, config });
      const remap = cells.remap.get({
        signal: signal.real,
        texture: texture.view,
        config,
      });
      const draw = cells.draw.get({ view: texture.view, config });

      runtime = {
        state,
        sliceWave,
        windowing,
        fourier: cells.fourier,
        magnitudify,
        decibelify,
        remap,
        draw,
      };
      return runtime;
    }),
    updateConfig: (patchConfig) => {
      draftConfig = applySpectrogramPatchConfig({
        base: config,
        draft: draftConfig,
        patch: patchConfig,
      });
    },
    dispose: () => {
      cells.state.dispose();
      cells.sliceWave.dispose();
      cells.windowing.dispose();
      cells.fourier.destroy();
      cells.magnitudify.dispose();
      cells.decibelify.dispose();
      cells.remap.dispose();
      cells.draw.dispose();
    },
  };
};
