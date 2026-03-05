import { createState, type State } from './state.js';

const workgroupSize = 64;

export type SpectrogramWindowing = {
  run: (encoder: GPUCommandEncoder) => void;
  configure: State['configure'];
  destroy: State['destroy'];
};

export const createSpectrogramWindowing = (
  device: GPUDevice,
  marker?: GPUComputePassTimestampWrites,
): SpectrogramWindowing => {
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
