import { type ExtPipelineConfig } from '../../pipeline.js';
import { createParams, type StateParams } from './params.js';
import { createPipeline } from './pipeline.js';

export type Config = Pick<
  ExtPipelineConfig,
  | 'windowSize'
  | 'sampleRate'
  | 'zeroPaddingFactor'
  | 'minFrequency'
  | 'maxFrequency'
  | 'viewSize'
>;

export type State = {
  pipeline: GPUComputePipeline;
  config: Config;
  params: StateParams;
  bindGroup: GPUBindGroup;
  configure: (
    signal: GPUBuffer,
    texture: GPUTextureView,
    config: Config,
  ) => void;
  destroy: () => void;
};

export const createState = (device: GPUDevice) => {
  const pipeline = createPipeline(device);
  const params = createParams(device);

  const ref: State = {
    pipeline,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    config: undefined!,
    params,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    bindGroup: undefined!,
    configure: (signal, texture, config) => {
      ref.config = config;
      params.write(config);
      ref.bindGroup = device.createBindGroup({
        label: 'remap-column-bind-group',
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: signal } },
          { binding: 1, resource: texture },
          { binding: 2, resource: { buffer: params.buffer } },
        ],
      });
    },
    destroy: () => {
      ref.params.destroy();
    },
  };
  return ref;
};
