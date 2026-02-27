// Based on FFT.js by Fedor Indutny (MIT License)
// Source: https://github.com/indutny/fft.js
// Adapted for WGSL and the Musetric project

import reverseShader from './reverse.wgsl?raw';
import transformShader from './transform.wgsl?raw';

export const createReversePipeline = (device: GPUDevice) => {
  const module = device.createShaderModule({
    label: 'fft4-reverse-shader',
    code: reverseShader,
  });
  return device.createComputePipeline({
    label: 'fft4-reverse-pipeline',
    layout: 'auto',
    compute: { module, entryPoint: 'main' },
  });
};

export const createTransformPipeline = (device: GPUDevice) => {
  const module = device.createShaderModule({
    label: 'fft4-transform-shader',
    code: transformShader,
  });
  return device.createComputePipeline({
    label: 'fft4-transform-pipeline',
    layout: 'auto',
    compute: { module, entryPoint: 'main' },
  });
};
