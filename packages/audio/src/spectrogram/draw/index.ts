import {
  createResourceCell,
  type ResourceCell,
} from '@musetric/resource-utils';
import { setOffscreenCanvasSize } from '../../common/offscreenCanvas.cross.js';
import { type SpectrogramConfig } from '../config.es.js';
import { createColorsCell } from './colors.js';
import { createPipeline } from './pipeline.js';
import { createStateProgressCell } from './progress.js';

export type SpectrogramDrawConfig = Pick<
  SpectrogramConfig,
  'viewSize' | 'visibleTimeBefore' | 'visibleTimeAfter' | 'colors'
>;

export type SpectrogramDraw = {
  run: (encoder: GPUCommandEncoder) => void;
};

export type SpectrogramDrawArg = {
  view: GPUTextureView;
  config: SpectrogramDrawConfig;
};

export const createSpectrogramDrawCell = (
  device: GPUDevice,
  canvas: OffscreenCanvas,
  marker?: GPUComputePassTimestampWrites,
): ResourceCell<SpectrogramDrawArg, SpectrogramDraw> => {
  const context = canvas.getContext('webgpu');
  if (!context) {
    throw new Error('WebGPU context not available on the canvas');
  }

  const pipeline = createPipeline(device, context);
  const progressCell = createStateProgressCell(device);
  const colorsCell = createColorsCell(device);
  const sampler = device.createSampler({
    label: 'draw-sampler',
    magFilter: 'nearest',
    minFilter: 'nearest',
  });
  const bindGroupCell = createResourceCell({
    create: (arg: {
      view: GPUTextureView;
      colors: GPUBuffer;
      progress: GPUBuffer;
    }): GPUBindGroup =>
      device.createBindGroup({
        label: 'draw-bind-group',
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: arg.colors } },
          { binding: 1, resource: { buffer: arg.progress } },
          { binding: 2, resource: sampler },
          { binding: 3, resource: arg.view },
        ],
      }),
    dispose: () => undefined,
    equals: (current, next) =>
      current.view === next.view &&
      current.colors === next.colors &&
      current.progress === next.progress,
  });

  return {
    get: (arg) => {
      const { view, config } = arg;
      setOffscreenCanvasSize(canvas, config.viewSize);
      const progress = progressCell.get(config);
      const colors = colorsCell.get(config);
      const bindGroup = bindGroupCell.get({
        view,
        colors: colors.buffer,
        progress: progress.buffer,
      });

      return {
        run: (encoder) => {
          const targetView = context.getCurrentTexture().createView({
            label: 'draw-view',
          });
          const pass = encoder.beginRenderPass({
            label: 'draw-pass',
            colorAttachments: [
              {
                view: targetView,
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
      };
    },
    dispose: () => {
      bindGroupCell.dispose();
      colorsCell.dispose();
      progressCell.dispose();
    },
  };
};
