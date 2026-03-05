import { setCanvasSize } from '../../common/canvas.js';
import { type SpectrogramConfig } from '../config.js';
import { createColors } from './colors.js';
import { createPipeline } from './pipeline.js';
import { createStateProgress } from './progress.js';

export type SpectrogramDrawConfig = Pick<
  SpectrogramConfig,
  'viewSize' | 'visibleTimeBefore' | 'visibleTimeAfter' | 'colors'
>;

export type SpectrogramDraw = {
  run: (encoder: GPUCommandEncoder) => void;
  configure: (view: GPUTextureView, config: SpectrogramDrawConfig) => void;
  destroy: () => void;
};
export const createSpectrogramDraw = (
  device: GPUDevice,
  canvas: OffscreenCanvas,
  marker?: GPUComputePassTimestampWrites,
): SpectrogramDraw => {
  const context = canvas.getContext('webgpu');
  if (!context) {
    throw new Error('WebGPU context not available on the canvas');
  }

  const pipeline = createPipeline(device, context);
  const progress = createStateProgress(device);
  const colors = createColors(device);
  const sampler = device.createSampler({
    label: 'draw-sampler',
    magFilter: 'nearest',
    minFilter: 'nearest',
  });
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let bindGroup: GPUBindGroup;

  const ref: SpectrogramDraw = {
    run: (encoder) => {
      const view = context.getCurrentTexture().createView({
        label: 'draw-view',
      });
      const pass = encoder.beginRenderPass({
        label: 'draw-pass',
        colorAttachments: [
          {
            view,
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
        timestampWrites: marker,
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();
    },
    configure: (view, config) => {
      setCanvasSize(canvas, config.viewSize);
      progress.write(config);
      colors.write(config);
      bindGroup = device.createBindGroup({
        label: 'draw-bind-group',
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: colors.buffer } },
          { binding: 1, resource: { buffer: progress.buffer } },
          { binding: 2, resource: sampler },
          { binding: 3, resource: view },
        ],
      });
    },
    destroy: () => {
      colors.destroy();
      progress.destroy();
    },
  };

  return ref;
};
