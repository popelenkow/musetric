import { Box } from '@mui/material';
import { type FC } from 'react';
import { SpectrogramCanvas } from './spectrogram/SpectrogramCanvas.js';
import { useProjectStore } from './store.js';
import { Subtitle } from './subtitle/Subtitle.js';
import { TrackVolumeList } from './waveform/TrackVolumeList.js';
import { WaveformList } from './waveform/WaveformList.js';

export type ProjectContentProps = {
  projectId: number;
};

export const ProjectContent: FC<ProjectContentProps> = (props) => {
  const { projectId } = props;
  const detailsMode = useProjectStore((state) => state.detailsMode);
  const visualizationMode = useProjectStore((state) => state.visualizationMode);

  return (
    <Box
      display='grid'
      width='100%'
      flexGrow={1}
      minHeight={0}
      gap={2}
      overflow='hidden'
      gridTemplateColumns={{
        xs: 'minmax(0, 1fr)',
        md: 'minmax(0, 1fr) 460px',
      }}
      gridTemplateRows={{
        xs: 'minmax(0, 1fr) minmax(0, 1fr)',
        md: 'minmax(0, 1fr)',
      }}
      gridTemplateAreas={{
        xs: `
          "details"
          "visualization"
        `,
        md: '"visualization details"',
      }}
    >
      <Box gridArea='details'>
        {detailsMode === 'mixer' && <TrackVolumeList />}
        {detailsMode === 'subtitles' && <Subtitle projectId={projectId} />}
      </Box>
      <Box gridArea='visualization'>
        {visualizationMode === 'waveform' && (
          <WaveformList projectId={projectId} />
        )}
        {visualizationMode === 'spectrogram' && (
          <Box flexGrow={1} flexBasis={0} height='100%' overflow='hidden'>
            <SpectrogramCanvas />
          </Box>
        )}
      </Box>
    </Box>
  );
};
