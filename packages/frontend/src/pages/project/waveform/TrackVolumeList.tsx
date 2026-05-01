import { Stack } from '@mui/material';
import { stemTypes } from '@musetric/audio';
import { type FC } from 'react';
import { useProjectStore } from '../store.js';
import { TrackVolumeControl } from './TrackVolumeControl.js';
import { useTrackListScroll } from './useTrackListScroll.js';

export const TrackVolumeList: FC = () => {
  const listRef = useTrackListScroll();
  const setTrackListScrollTop = useProjectStore(
    (state) => state.setTrackListScrollTop,
  );
  const visualizationMode = useProjectStore((state) => state.visualizationMode);

  return (
    <Stack
      ref={listRef}
      gap={1}
      height='100%'
      overflow='auto'
      sx={
        visualizationMode === 'waveform'
          ? {
              scrollbarWidth: {
                md: 'none',
              },
              '&::-webkit-scrollbar': {
                display: {
                  md: 'none',
                },
              },
            }
          : undefined
      }
      onScroll={(event) => {
        const { scrollTop } = event.currentTarget;
        setTrackListScrollTop(scrollTop);
      }}
    >
      {stemTypes.map((stemType) => (
        <Stack key={stemType} height={100} flexShrink={0}>
          <TrackVolumeControl stemType={stemType} />
        </Stack>
      ))}
    </Stack>
  );
};
