import { type api } from '@musetric/api';
import { type FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ViewError } from '../../components/ViewError.js';
import { ViewPending } from '../../components/ViewPending.js';
import { usePlayerStore } from '../player/store.js';
import { useWaveformStore } from './store.js';

export type WaveformCanvasProps = {
  projectId: number;
  type: api.wave.Type;
};

export const WaveformCanvas: FC<WaveformCanvasProps> = (props) => {
  const { projectId, type } = props;
  const { t } = useTranslation();

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>();
  const seek = usePlayerStore((s) => s.seek);
  const init = useWaveformStore((s) => s.init);
  const attachCanvas = useWaveformStore((s) => s.attachCanvas);
  const status = useWaveformStore((s) => s.status);

  useEffect(() => {
    return init(projectId, type);
  }, [init, projectId, type]);

  useEffect(() => {
    if (!canvas) return;
    return attachCanvas(canvas);
  }, [attachCanvas, canvas]);

  if (status === 'pending') {
    return <ViewPending />;
  }

  if (status === 'error') {
    return <ViewError message={t('pages.project.progress.error.waveform')} />;
  }

  return (
    <canvas
      ref={setCanvas}
      style={{ height: '100%', width: '100%', display: 'block' }}
      onClick={async (event) => {
        const targetCanvas = event.currentTarget;
        const rect = targetCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        await seek(x / targetCanvas.clientWidth);
      }}
    />
  );
};
