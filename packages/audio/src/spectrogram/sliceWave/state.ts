import {
  createResourceCell,
  type ResourceCell,
} from '@musetric/resource-utils';
import { type ExtSpectrogramConfig } from '../common/extConfig.js';
import { createParamsCell, type StateParams } from './params.js';
import { createStateWaveCell, type StateWave } from './wave.js';

export type Config = Pick<
  ExtSpectrogramConfig,
  | 'windowSize'
  | 'windowCount'
  | 'sampleRate'
  | 'visibleTimeBefore'
  | 'visibleTimeAfter'
  | 'zeroPaddingFactor'
>;

export type StateArg = {
  out: GPUBuffer;
  config: Config;
};

export type State = {
  pipeline: GPUComputePipeline;
  config: Config;
  params: StateParams;
  wave: StateWave;
  bindGroup: GPUBindGroup;
};

export const createStateCell = (
  device: GPUDevice,
  pipeline: GPUComputePipeline,
): ResourceCell<StateArg, State> => {
  const paramsCell = createParamsCell(device);
  const waveCell = createStateWaveCell(device);
  const bindGroupCell = createResourceCell({
    create: (arg: {
      out: GPUBuffer;
      params: GPUBuffer;
      wave: GPUBuffer;
    }): GPUBindGroup =>
      device.createBindGroup({
        label: 'slice-wave-bind-group',
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: arg.wave } },
          { binding: 1, resource: { buffer: arg.out } },
          { binding: 2, resource: { buffer: arg.params } },
        ],
      }),
    dispose: () => undefined,
    equals: (current, next) =>
      current.out === next.out &&
      current.params === next.params &&
      current.wave === next.wave,
  });

  return {
    get: (arg) => {
      const { out, config } = arg;
      const params = paramsCell.get(config);
      const wave = waveCell.get(params.value.visibleSamples);
      const bindGroup = bindGroupCell.get({
        out,
        params: params.buffer,
        wave: wave.buffer,
      });

      return {
        pipeline,
        config,
        params,
        wave,
        bindGroup,
      };
    },
    dispose: () => {
      bindGroupCell.dispose();
      waveCell.dispose();
      paramsCell.dispose();
    },
  };
};
