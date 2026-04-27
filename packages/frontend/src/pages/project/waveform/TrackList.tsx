import { Box, Paper, Stack } from '@mui/material';
import { stemTypes } from '@musetric/audio';
import { type FC } from 'react';
import { useProjectStore } from '../store.js';
import { TrackVolumeControl } from './TrackVolumeControl.js';
import { WaveformCanvas } from './WaveformCanvas.js';

export type TrackListProps = {
  projectId: number;
};

export const TrackList: FC<TrackListProps> = (props) => {
  const { projectId } = props;
  const visualizationMode = useProjectStore((state) => state.visualizationMode);
  const detailsMode = useProjectStore((state) => state.detailsMode);

  if (detailsMode !== 'mixer' && visualizationMode !== 'waveform') {
    return;
  }

  return (
    <Stack
      gap={1}
      flexGrow={visualizationMode === 'waveform' ? 1 : undefined}
      sx={{
        overflowY: 'auto',
        scrollbarGutter: 'stable',
      }}
    >
      {stemTypes.map((stemType) => (
        <Stack
          key={stemType}
          direction='row'
          gap={1}
          height={100}
          flexShrink={0}
        >
          {detailsMode === 'mixer' && (
            <Box width={200}>
              <TrackVolumeControl stemType={stemType} />
            </Box>
          )}
          {visualizationMode === 'waveform' && (
            <Box component={Paper} elevation={3} flexGrow={1}>
              <WaveformCanvas projectId={projectId} stemType={stemType} />
            </Box>
          )}
        </Stack>
      ))}
    </Stack>
  );
};
