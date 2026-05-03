import { Box, Paper, Stack } from '@mui/material';
import { stemTypes } from '@musetric/audio';
import { type FC } from 'react';
import { useProjectStore } from '../store.js';
import {
  hiddenTrackListScrollbarSx,
  useTrackListScroll,
} from './useTrackListScroll.js';
import { WaveformCanvas } from './WaveformCanvas.js';

export type WaveformListProps = {
  projectId: number;
};

export const WaveformList: FC<WaveformListProps> = (props) => {
  const { projectId } = props;

  const listRef = useTrackListScroll();
  const detailsMode = useProjectStore((state) => state.detailsMode);

  return (
    <Stack
      ref={listRef}
      gap={1}
      height='100%'
      overflow='auto'
      sx={detailsMode === 'mixer' ? hiddenTrackListScrollbarSx : undefined}
    >
      {stemTypes.map((stemType) => (
        <Box
          key={stemType}
          component={Paper}
          elevation={3}
          height={100}
          flexShrink={0}
        >
          <WaveformCanvas projectId={projectId} stemType={stemType} />
        </Box>
      ))}
    </Stack>
  );
};
