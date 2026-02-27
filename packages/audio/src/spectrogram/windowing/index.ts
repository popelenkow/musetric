import { createState, type State } from './state.js';

const workgroupSize = 64;

export type Windowing = {
  run: (encoder: GPUCommandEncoder) => void;
  configure: State['configure'];
  destroy: State['destroy'];
};

export const createWindowing = (
  device: GPUDevice,
  marker?: GPUComputePassTimestampWrites,
): Windowing => {
  const state = createState(device);
  return {
    run: (encoder) => {
      const { windowSize, windowCount } = state.params.value;
      const xCount = Math.ceil(windowSize / workgroupSize);
      const pass = encoder.beginComputePass({
        label: 'windowing-pass',
        timestampWrites: marker,
      });
      pass.setPipeline(state.pipeline);
      pass.setBindGroup(0, state.bindGroup);
      pass.dispatchWorkgroups(xCount, windowCount);
      pass.end();
    },
    configure: state.configure,
    destroy: state.destroy,
  };
};
