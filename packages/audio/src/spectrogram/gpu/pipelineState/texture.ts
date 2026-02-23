import { type ViewSize } from '../../../common/viewSize.js';

export type StateTexture = {
  instance: GPUTexture;
  view: GPUTextureView;
  resize: (viewSize: ViewSize) => void;
  destroy: () => void;
};

export const createStateTexture = (device: GPUDevice): StateTexture => {
  const ref: StateTexture = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    instance: undefined!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    view: undefined!,
    resize: (viewSize) => {
      const { width, height } = viewSize;
      ref.instance?.destroy();
      ref.instance = device.createTexture({
        label: 'pipeline-texture',
        size: { width, height },
        format: 'rgba8unorm',
        usage:
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.STORAGE_BINDING,
      });
      ref.view = ref.instance.createView({
        label: 'pipeline-texture-view',
      });
    },
    destroy: () => {
      ref.instance?.destroy();
    },
  };
  return ref;
};
