import { Box } from '@mui/material';
import { type FC } from 'react';
import { engine } from '../../../engine/engine.js';
import { SpectrogramCanvas } from '../spectrogram/SpectrogramCanvas.js';
import { useProjectStore } from '../store.js';
import { getVisualizationFrameIndex } from '../visualization/visualizationSeek.js';
import {
  hiddenTrackListScrollbarSx,
  useTrackListScroll,
} from '../waveform/useTrackListScroll.js';
import { WaveformList } from '../waveform/WaveformList.js';

export const ProjectVisualization: FC = () => {
  const visualizationMode = useProjectStore((state) => state.visualizationMode);
  const detailsMode = useProjectStore((state) => state.detailsMode);
  const containerRef = useTrackListScroll(visualizationMode === 'waveform');

  return (
    <Box gridArea='visualization'>
      <Box
        ref={containerRef}
        height='100%'
        overflow='auto'
        onClick={(event) => {
          const newFrameIndex = getVisualizationFrameIndex(event);
          if (newFrameIndex === undefined) return;
          engine.player.seek(newFrameIndex);
        }}
        sx={
          visualizationMode === 'waveform' && detailsMode === 'mixer'
            ? hiddenTrackListScrollbarSx
            : undefined
        }
      >
        {visualizationMode === 'waveform' && <WaveformList />}
        {visualizationMode === 'spectrogram' && <SpectrogramCanvas />}
      </Box>
    </Box>
  );
};
