import { type FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ViewError } from '../../components/ViewError.js';
import { ViewPending } from '../../components/ViewPending.js';
import { usePlayerStore } from '../player/store.js';
import { useSettingsStore } from '../settings/store.js';
import { useSpectrogramStore } from './store.js';

export type SpectrogramCanvasProps = {
  status: 'pending' | 'error' | 'success';
};
export const SpectrogramCanvas: FC<SpectrogramCanvasProps> = (props) => {
  const { status } = props;
  const { t } = useTranslation();
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>();
  const seek = usePlayerStore((s) => s.seek);
  const playerStatus = usePlayerStore((s) => s.status);
  const fourierMode = useSettingsStore((s) => s.fourierMode);
  const mount = useSpectrogramStore((s) => s.mount);

  useEffect(() => {
    if (!canvas) return;
    return mount(canvas);
  }, [mount, canvas]);

  if (status === 'error' || playerStatus === 'error') {
    return <ViewError message={t('pages.project.progress.error.audioTrack')} />;
  }

  if (status === 'pending' || playerStatus === 'pending') {
    return <ViewPending />;
  }

  return (
    <canvas
      key={fourierMode}
      ref={setCanvas}
      style={{ width: '100%', height: '100%', display: 'block' }}
      onClick={async (event) => {
        const { visibleTimeBefore, visibleTimeAfter } =
          useSettingsStore.getState();
        const { progress, frameCount, sampleRate } = usePlayerStore.getState();

        if (!frameCount || !sampleRate) {
          return;
        }

        const targetCanvas = event.currentTarget;
        const rect = targetCanvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickRatio = clickX / targetCanvas.clientWidth;

        const totalVisibleTime = visibleTimeBefore + visibleTimeAfter;
        const timelineRatio = visibleTimeBefore / totalVisibleTime;
        const clickOffsetRatio = clickRatio - timelineRatio;
        const timeOffset = totalVisibleTime * sampleRate * clickOffsetRatio;
        const progressOffset = timeOffset / frameCount;

        const newProgress = Math.min(1, Math.max(0, progress + progressOffset));

        await seek(newProgress);
      }}
    />
  );
};
