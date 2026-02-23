import { type ComplexGpuBuffer } from '../../../common/complexArray.js';
import { type ExtPipelineConfig } from '../../pipeline.js';
import { createParams, type StateParams } from './params.js';
import { createPipelines, type Pipelines } from './pipeline.js';

export type Config = Pick<
  ExtPipelineConfig,
  'windowSize' | 'windowCount' | 'zeroPaddingFactor'
>;

export type State = {
  pipelines: Pipelines;
  config: Config;
  params: StateParams;
  bindGroup: GPUBindGroup;
  configure: (signal: ComplexGpuBuffer, config: Config) => void;
  destroy: () => void;
};

export const createState = (device: GPUDevice) => {
  const pipelines = createPipelines(device);
  const params = createParams(device);

  const ref: State = {
    pipelines,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    config: undefined!,
    params,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    bindGroup: undefined!,
    configure: (signal, config) => {
      ref.config = config;
      ref.params.write(config);
      ref.bindGroup = device.createBindGroup({
        label: 'magnitudify-bind-group',
        layout: pipelines.layout,
        entries: [
          { binding: 0, resource: { buffer: signal.real } },
          { binding: 1, resource: { buffer: signal.imag } },
          { binding: 2, resource: { buffer: params.buffer } },
        ],
      });
    },
    destroy: () => {
      params.destroy();
    },
  };
  return ref;
};
