import shaderCode from './index.wgsl?raw';

export const createPipeline = (device: GPUDevice) => {
  const module = device.createShaderModule({
    label: 'remap-column-shader',
    code: shaderCode,
  });
  return device.createComputePipeline({
    label: 'remap-column-pipeline',
    layout: 'auto',
    compute: { module, entryPoint: 'main' },
  });
};
