import { extractSpectrogramConfig } from '@musetric/audio';
import { type FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ViewError } from '../../../components/ViewError.js';
import { ViewPending } from '../../../components/ViewPending.js';
import { engine } from '../../../engine/engine.js';
import { useEngineStore } from '../../../engine/useEngineStore.js';
import { useSettingsStore } from '../settings/store.js';

export const SpectrogramCanvas: FC = () => {
  const { t } = useTranslation();
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>();
  const decoderStatus = useEngineStore((state) => state.statuses.decoder);
  const spectrogramStatus = useEngineStore(
    (state) => state.statuses.spectrogram,
  );

  useEffect(() => {
    if (!canvas) return;
    return engine.spectrogram.mount(
      canvas,
      extractSpectrogramConfig(useSettingsStore.getState()),
    );
  }, [canvas]);

  if (decoderStatus === 'error' || spectrogramStatus === 'error') {
    return <ViewError message={t('pages.project.progress.error.audioTrack')} />;
  }

  if (decoderStatus === 'pending') {
    return <ViewPending />;
  }

  return (
    <canvas
      ref={setCanvas}
      style={{ width: '100%', height: '100%', display: 'block' }}
      onClick={(event) => {
        const { visibleTimeBefore, visibleTimeAfter } =
          useSettingsStore.getState();
        const { frameCount, frameIndex } = engine.store.get();
        const { sampleRate } = engine.context;

        if (!frameCount) {
          return;
        }

        const targetCanvas = event.currentTarget;
        const rect = targetCanvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickRatio = clickX / targetCanvas.clientWidth;

        const totalVisibleTime = visibleTimeBefore + visibleTimeAfter;
        const playheadRatio = visibleTimeBefore / totalVisibleTime;
        const clickOffsetRatio = clickRatio - playheadRatio;
        const frameOffset = totalVisibleTime * sampleRate * clickOffsetRatio;
        const nextFrameIndex = Math.min(
          frameCount,
          Math.max(0, Math.floor(frameIndex + frameOffset)),
        );

        engine.player.seek(nextFrameIndex);
      }}
    />
  );
};
