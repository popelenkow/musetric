import { Box } from '@mui/material';
import { subscribeResizeObserver } from '@musetric/resource-utils/dom';
import { type FC, useEffect, useRef } from 'react';
import { engine } from '../../../engine/engine.js';
import { useSettingsStore } from '../settings/store.js';
import { useProjectStore } from '../store.js';

const engineRenderKeys = ['frameCount', 'frameIndex'] as const;
const projectRenderKeys = ['visualizationMode'] as const;
const settingsRenderKeys = ['playheadRatio'] as const;

const alignPixel = (value: number, pixelRatio: number) =>
  Math.round(value * pixelRatio) / pixelRatio;

export const VisualizationCursor: FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const { parentElement } = element;

    if (!parentElement) {
      return;
    }

    const render = () => {
      const { frameCount, frameIndex } = engine.store.get();
      const { playheadRatio } = useSettingsStore.getState();
      const { visualizationMode } = useProjectStore.getState();
      const waveformCursorRatio = frameCount ? frameIndex / frameCount : 0;
      const cursorRatio =
        visualizationMode === 'spectrogram'
          ? playheadRatio
          : waveformCursorRatio;
      const { width } = parentElement.getBoundingClientRect();
      const cursorX = alignPixel(cursorRatio * width, window.devicePixelRatio);

      element.style.transform = `translateX(${cursorX}px)`;
    };

    render();

    const unsubscribes = [
      subscribeResizeObserver(parentElement, render),
      ...engineRenderKeys.map((key) =>
        engine.store.subscribe((state) => state[key], render),
      ),
      ...projectRenderKeys.map((key) =>
        useProjectStore.subscribe((state) => state[key], render),
      ),
      ...settingsRenderKeys.map((key) =>
        useSettingsStore.subscribe((state) => state[key], render),
      ),
    ];

    return () => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <Box
      ref={ref}
      position='absolute'
      top={0}
      bottom={0}
      left={0}
      width='1px'
      sx={{
        backgroundColor: (theme) => theme.palette.primary.main,
        pointerEvents: 'none',
        willChange: 'transform',
        zIndex: 0,
      }}
    />
  );
};
