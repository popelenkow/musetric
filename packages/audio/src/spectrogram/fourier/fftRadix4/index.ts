import { type CreateFourier, type Fourier } from '../types.js';
import { createReversePipeline, createTransformPipeline } from './pipeline.js';
import { createStateCell } from './state.js';

export const createFftRadix4: CreateFourier = (device, markers) => {
  const pipelines = {
    reverse: createReversePipeline(device),
    transform: createTransformPipeline(device),
  };
  const stateCell = createStateCell(device, pipelines);

  return {
    get: (arg) => {
      const state = stateCell.get(arg);

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

      const ref: Fourier = {
        forward: (encoder) => {
          reverse(encoder);
          transform(encoder);
        },
      };

      return ref;
    },
    dispose: () => {
      stateCell.dispose();
    },
  };
};
