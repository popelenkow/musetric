import { createState, type State } from './state.js';

const workgroupSize = 64;

export type SliceWave = {
  run: (encoder: GPUCommandEncoder) => void;
  configure: State['configure'];
  write: State['write'];
  destroy: () => void;
};

export const createSliceWave = (
  device: GPUDevice,
  marker?: GPUComputePassTimestampWrites,
): SliceWave => {
  const state = createState(device);

  return {
    run: (encoder) => {
      const { paddedWindowSize, windowCount } = state.params.value;
      const xGroups = Math.ceil(paddedWindowSize / workgroupSize);
      const pass = encoder.beginComputePass({
        label: 'slice-wave-pass',
        timestampWrites: marker,
      });
      pass.setPipeline(state.pipeline);
      pass.setBindGroup(0, state.bindGroup);
      pass.dispatchWorkgroups(xGroups, windowCount);
      pass.end();
    },
    configure: state.configure,
    write: state.write,
    destroy: () => {
      state.destroy();
    },
  };
};
