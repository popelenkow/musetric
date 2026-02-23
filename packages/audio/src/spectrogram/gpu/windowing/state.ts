import { type ExtPipelineConfig } from '../../pipeline.js';
import { createParams, type StateParams } from './params.js';
import { createPipeline } from './pipeline.js';
import { createWindowFunction } from './windowFunction.js';

export type Config = Pick<
  ExtPipelineConfig,
  'windowSize' | 'windowCount' | 'zeroPaddingFactor' | 'windowName'
>;

export type State = {
  pipeline: GPUComputePipeline;
  config: Config;
  params: StateParams;
  bindGroup: GPUBindGroup;
  configure: (signal: GPUBuffer, config: Config) => void;
  destroy: () => void;
};
export const createState = (device: GPUDevice): State => {
  const pipeline = createPipeline(device);
  const params = createParams(device);
  const windowFunction = createWindowFunction(device);

  const ref: State = {
    pipeline,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    config: undefined!,
    params,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    bindGroup: undefined!,
    configure: (signal, config) => {
      ref.config = config;
      params.write(config);
      windowFunction.configure(config);
      ref.bindGroup = device.createBindGroup({
        label: 'windowing-bind-group',
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: signal } },
          { binding: 1, resource: { buffer: params.buffer } },
          { binding: 2, resource: { buffer: windowFunction.buffer } },
        ],
      });
    },
    destroy: () => {
      params.destroy();
      windowFunction.destroy();
    },
  };
  return ref;
};
