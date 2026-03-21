import { createResourceCell } from '@musetric/resource-utils';
import { type Pipelines } from './pipeline.js';

type Arg = {
  signal: GPUBuffer;
  reverseTable: GPUBuffer;
  params: GPUBuffer;
};

export const createReverseBindGroupCell = (
  device: GPUDevice,
  pipelines: Pipelines,
) =>
  createResourceCell({
    create: (arg: Arg): GPUBindGroup =>
      device.createBindGroup({
        label: 'fft4-reverse-bind-group',
        layout: pipelines.reverse.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: arg.signal } },
          { binding: 1, resource: { buffer: arg.reverseTable } },
          { binding: 2, resource: { buffer: arg.params } },
        ],
      }),
    dispose: () => undefined,
    equals: (current, next) =>
      current.signal === next.signal &&
      current.reverseTable === next.reverseTable &&
      current.params === next.params,
  });
