import reverseShader from './reverse.wgsl?raw';
import transformShader from './transform.wgsl?raw';

export const createReversePipeline = (device: GPUDevice) => {
  const module = device.createShaderModule({
    label: 'fft2-reverse-shader',
    code: reverseShader,
  });
  return device.createComputePipeline({
    label: 'fft2-reverse-pipeline',
    layout: 'auto',
    compute: { module, entryPoint: 'main' },
  });
};

export const createTransformPipeline = (device: GPUDevice) => {
  const module = device.createShaderModule({
    label: 'fft2-transform-shader',
    code: transformShader,
  });
  return device.createComputePipeline({
    label: 'fft2-transform-pipeline',
    layout: 'auto',
    compute: { module, entryPoint: 'main' },
  });
};
