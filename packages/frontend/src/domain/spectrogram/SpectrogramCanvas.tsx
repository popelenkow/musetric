import { type FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ViewError } from '../../components/ViewError.js';
import { ViewPending } from '../../components/ViewPending.js';
import { useDecoderStore } from '../decoder/store.js';
import { usePlayerStore } from '../player/store.js';
import { useSettingsStore } from '../settings/store.js';
import { useSpectrogramStore } from './store.js';

export const SpectrogramCanvas: FC = () => {
  const { t } = useTranslation();
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>();
  const seek = usePlayerStore((s) => s.seek);
  const decoderStatus = useDecoderStore((s) => s.status);
  const spectrogramStatus = useSpectrogramStore((s) => s.status);
  const playerStatus = usePlayerStore((s) => s.status);
  const fourierMode = useSettingsStore((s) => s.fourierMode);
  const init = useSpectrogramStore((s) => s.init);

  useEffect(() => {
    if (!canvas) return;
    return init(canvas);
  }, [canvas, init]);

  if (
    decoderStatus === 'error' ||
    spectrogramStatus === 'error' ||
    playerStatus === 'error'
  ) {
    return <ViewError message={t('pages.project.progress.error.audioTrack')} />;
  }

  if (decoderStatus === 'pending' || playerStatus === 'pending') {
    return <ViewPending />;
  }

  return (
    <canvas
      ref={setCanvas}
      key={fourierMode}
      style={{ width: '100%', height: '100%', display: 'block' }}
      onClick={async (event) => {
        const { visibleTimeBefore, visibleTimeAfter, sampleRate } =
          useSettingsStore.getState();
        const { progress } = usePlayerStore.getState();
        const { frameCount } = useDecoderStore.getState();

        if (!frameCount) {
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
