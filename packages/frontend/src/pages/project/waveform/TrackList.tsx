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
  const isWaveformVisible = useProjectStore((state) => state.isWaveformVisible);
  const isVolumeMixerVisible = useProjectStore(
    (state) => state.isVolumeMixerVisible,
  );

  if (!isVolumeMixerVisible && !isWaveformVisible) {
    return;
  }

  return (
    <Stack
      gap={1}
      flexGrow={isWaveformVisible ? 1 : undefined}
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
          {isVolumeMixerVisible && (
            <Box width={200}>
              <TrackVolumeControl stemType={stemType} />
            </Box>
          )}
          {isWaveformVisible && (
            <Box component={Paper} elevation={3} flexGrow={1}>
              <WaveformCanvas projectId={projectId} stemType={stemType} />
            </Box>
          )}
        </Stack>
      ))}
    </Stack>
  );
};
