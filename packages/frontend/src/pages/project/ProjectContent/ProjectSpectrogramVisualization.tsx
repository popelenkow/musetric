import { Box } from '@mui/material';
import { type FC } from 'react';
import { engine } from '../../../engine/engine.js';
import { SpectrogramCanvas } from '../spectrogram/SpectrogramCanvas.js';
import { SpectrogramNoteScale } from '../spectrogram/SpectrogramNoteScale/index.js';
import { VisualizationCursor } from '../visualization/VisualizationCursor.js';
import { getSpectrogramFrameIndex } from '../visualization/visualizationSeek.js';
import { VisualizationTimeline } from '../visualization/VisualizationTimeline.js';

export const ProjectSpectrogramVisualization: FC = () => {
  return (
    <Box
      flex={{
        xs: '2 1 0',
        md: '1 1 0',
      }}
      display='grid'
      gridTemplateRows='minmax(0, 1fr) auto'
      position='relative'
      minHeight={0}
      minWidth={0}
      onClick={(event) => {
        const newFrameIndex = getSpectrogramFrameIndex(event);
        if (newFrameIndex === undefined) return;
        engine.player.seek(newFrameIndex);
      }}
    >
      <Box height='100%' position='relative'>
        <SpectrogramCanvas />
        <SpectrogramNoteScale />
        <VisualizationCursor />
      </Box>
      <VisualizationTimeline />
    </Box>
  );
};
