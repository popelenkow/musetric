import { Box, Stack } from '@mui/material';
import { type FC } from 'react';
import { SpectrogramCanvas } from '../spectrogram/SpectrogramCanvas.js';
import { useProjectStore } from '../store.js';
import { TrackList } from './TrackList.js';

export type ProjectMainContentProps = {
  projectId: number;
};

export const ProjectMainContent: FC<ProjectMainContentProps> = (props) => {
  const { projectId } = props;
  const visualizationMode = useProjectStore((state) => state.visualizationMode);

  return (
    <Stack direction='row' flexGrow={1} overflow='hidden'>
      <TrackList projectId={projectId} />
      {visualizationMode === 'spectrogram' && (
        <Box flexGrow={1} flexBasis={0} height='100%' overflow='hidden'>
          <SpectrogramCanvas />
        </Box>
      )}
    </Stack>
  );
};
