import shaderCode from './index.wgsl?raw';

export const createPipeline = (device: GPUDevice) => {
  const module = device.createShaderModule({
    label: 'slice-wave-shader',
    code: shaderCode,
  });
  return device.createComputePipeline({
    label: 'slice-wave-pipeline',
    layout: 'auto',
    compute: { module, entryPoint: 'main' },
  });
};
