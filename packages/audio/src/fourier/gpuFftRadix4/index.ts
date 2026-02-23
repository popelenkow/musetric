import { type CreateGpuFourier, type GpuFourier } from '../gpuFourier.js';
import { createState } from './state.js';

export const createGpuFftRadix4: CreateGpuFourier = (device, markers) => {
  const state = createState(device);

  const reverse = (encoder: GPUCommandEncoder) => {
    const { windowCount } = state.params.value;

    const pass = encoder.beginComputePass({
      label: 'fft4-reverse-pass',
      timestampWrites: markers?.reverse,
    });
    pass.setPipeline(state.pipelines.reverse);
    pass.setBindGroup(0, state.bindGroups.reverse);
    pass.dispatchWorkgroups(windowCount);
    pass.end();
  };
  const transform = (encoder: GPUCommandEncoder) => {
    const { windowCount } = state.params.value;

    const pass = encoder.beginComputePass({
      label: 'fft4-transform-pass',
      timestampWrites: markers?.transform,
    });
    pass.setPipeline(state.pipelines.transform);
    pass.setBindGroup(0, state.bindGroups.transform);
    pass.dispatchWorkgroups(windowCount);
    pass.end();
  };

  const ref: GpuFourier = {
    forward: (encoder) => {
      reverse(encoder);
      transform(encoder);
    },
    configure: state.configure,
    destroy: state.destroy,
  };
  return ref;
};
