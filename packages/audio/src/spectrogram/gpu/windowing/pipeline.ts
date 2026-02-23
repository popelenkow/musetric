import shaderCode from './index.wgsl?raw';

export const createPipeline = (device: GPUDevice) => {
  const module = device.createShaderModule({
    label: 'windowing-shader',
    code: shaderCode,
  });
  return device.createComputePipeline({
    label: 'windowing-pipeline',
    layout: 'auto',
    compute: { module, entryPoint: 'main' },
  });
};
