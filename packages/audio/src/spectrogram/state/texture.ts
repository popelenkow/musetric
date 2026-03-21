import { createResourceCell } from '@musetric/resource-utils';
import type { ViewSize } from '../../common/viewSize.es.js';

export type StateTexture = {
  instance: GPUTexture;
  view: GPUTextureView;
};
export const createStateTextureCell = (device: GPUDevice) =>
  createResourceCell({
    create: (viewSize: ViewSize): StateTexture => {
      const { width, height } = viewSize;

      const instance = device.createTexture({
        label: 'pipeline-texture',
        size: { width, height },
        format: 'rgba8unorm',
        usage:
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.STORAGE_BINDING,
      });

      return {
        instance,
        view: instance.createView({
          label: 'pipeline-texture-view',
        }),
      };
    },
    dispose: (texture) => texture.instance.destroy(),
    equals: (current, next) =>
      current.width === next.width && current.height === next.height,
  });
