import { createResourceCell } from '@musetric/resource-utils';
import { type Pipelines } from './pipeline.js';

type Arg = {
  real: GPUBuffer;
  imag: GPUBuffer;
  trigTable: GPUBuffer;
  params: GPUBuffer;
};

export const createTransformBindGroupCell = (
  device: GPUDevice,
  pipelines: Pipelines,
) =>
  createResourceCell({
    create: (arg: Arg): GPUBindGroup =>
      device.createBindGroup({
        label: 'fft2-transform-bind-group',
        layout: pipelines.transform.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: arg.real } },
          { binding: 1, resource: { buffer: arg.imag } },
          { binding: 2, resource: { buffer: arg.trigTable } },
          { binding: 3, resource: { buffer: arg.params } },
        ],
      }),
    dispose: () => undefined,
    equals: (current, next) =>
      current.real === next.real &&
      current.imag === next.imag &&
      current.trigTable === next.trigTable &&
      current.params === next.params,
  });
