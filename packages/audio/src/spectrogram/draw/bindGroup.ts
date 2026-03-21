import { createResourceCell } from '@musetric/resource-utils';

export type DrawBindGroupArg = {
  view: GPUTextureView;
  colors: GPUBuffer;
  progress: GPUBuffer;
  layout: GPUBindGroupLayout;
};

export const createBindGroupCell = (device: GPUDevice, sampler: GPUSampler) =>
  createResourceCell({
    create: (arg: DrawBindGroupArg): GPUBindGroup =>
      device.createBindGroup({
        label: 'draw-bind-group',
        layout: arg.layout,
        entries: [
          { binding: 0, resource: { buffer: arg.colors } },
          { binding: 1, resource: { buffer: arg.progress } },
          { binding: 2, resource: sampler },
          { binding: 3, resource: arg.view },
        ],
      }),
    dispose: () => undefined,
    equals: (current, next) =>
      current.view === next.view &&
      current.colors === next.colors &&
      current.progress === next.progress &&
      current.layout === next.layout,
  });
