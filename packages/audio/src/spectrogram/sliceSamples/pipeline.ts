import shaderCode from './index.wgsl?raw';

export const createPipeline = (device: GPUDevice) => {
  const module = device.createShaderModule({
    label: 'slice-samples-shader',
    code: shaderCode,
  });
  return device.createComputePipeline({
    label: 'slice-samples-pipeline',
    layout: 'auto',
    compute: { module, entryPoint: 'main' },
  });
};
