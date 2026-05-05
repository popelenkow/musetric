import { Box } from '@mui/material';
import { type FC } from 'react';
import { useProjectStore } from '../store.js';
import { Subtitle } from '../subtitle/Subtitle.js';
import { TrackVolumeList } from '../waveform/TrackVolumeList.js';

export const ProjectDetails: FC = () => {
  const detailsMode = useProjectStore((state) => state.detailsMode);

  return (
    <Box gridArea='details'>
      {detailsMode === 'mixer' && <TrackVolumeList />}
      {detailsMode === 'subtitles' && <Subtitle />}
    </Box>
  );
};
