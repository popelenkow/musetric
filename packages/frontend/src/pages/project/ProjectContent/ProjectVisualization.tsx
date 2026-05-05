import { Box } from '@mui/material';
import { type FC } from 'react';
import { SpectrogramCanvas } from '../spectrogram/SpectrogramCanvas.js';
import { useProjectStore } from '../store.js';
import { WaveformList } from '../waveform/WaveformList.js';

export const ProjectVisualization: FC = () => {
  const visualizationMode = useProjectStore((state) => state.visualizationMode);

  return (
    <Box gridArea='visualization'>
      {visualizationMode === 'waveform' && <WaveformList />}
      {visualizationMode === 'spectrogram' && (
        <Box flexGrow={1} flexBasis={0} height='100%' overflow='hidden'>
          <SpectrogramCanvas />
        </Box>
      )}
    </Box>
  );
};
