import { Box } from '@mui/material';
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
  const status = useWaveformStore((s) => s.status);

  useEffect(() => {
    if (!canvas) return;
    return init(projectId, type, canvas);
  }, [canvas, init, projectId, type]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={setCanvas}
        key={`${projectId}-${type}`}
        style={{
          height: '100%',
          width: '100%',
          display: 'block',
          visibility: status === 'success' ? 'visible' : 'hidden',
        }}
        onClick={async (event) => {
          const targetCanvas = event.currentTarget;
          const rect = targetCanvas.getBoundingClientRect();
          const x = event.clientX - rect.left;
          await seek(x / targetCanvas.clientWidth);
        }}
      />
      {status === 'pending' && (
        <Box sx={{ position: 'absolute', inset: 0 }}>
          <ViewPending />
        </Box>
      )}
      {status === 'error' && (
        <Box sx={{ position: 'absolute', inset: 0 }}>
          <ViewError message={t('pages.project.progress.error.waveform')} />
        </Box>
      )}
    </div>
  );
};
