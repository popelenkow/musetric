import { Box, Paper, Stack } from '@mui/material';
import { waveTypes } from '@musetric/audio';
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
      {waveTypes.map((waveType) => (
        <Stack
          key={waveType}
          direction='row'
          gap={1}
          height={100}
          flexShrink={0}
        >
          {isVolumeMixerVisible && (
            <Box width={200}>
              <TrackVolumeControl waveType={waveType} />
            </Box>
          )}
          {isWaveformVisible && (
            <Box component={Paper} elevation={3} flexGrow={1}>
              <WaveformCanvas projectId={projectId} type={waveType} />
            </Box>
          )}
        </Stack>
      ))}
    </Stack>
  );
};
