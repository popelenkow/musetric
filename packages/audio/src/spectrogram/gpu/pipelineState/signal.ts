import { type ComplexGpuBuffer } from '../../../common/complexArray.js';

export const createSignalBuffer = (
  device: GPUDevice,
  windowSize: number,
  windowCount: number,
): ComplexGpuBuffer => ({
  real: device.createBuffer({
    label: 'pipeline-signal-real-buffer',
    size: windowSize * windowCount * Float32Array.BYTES_PER_ELEMENT,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  }),
  imag: device.createBuffer({
    label: 'pipeline-signal-imag-buffer',
    size: windowSize * windowCount * Float32Array.BYTES_PER_ELEMENT,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  }),
});
