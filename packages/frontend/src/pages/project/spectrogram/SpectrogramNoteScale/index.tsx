import { Box } from '@mui/material';
import { type FC, useMemo } from 'react';
import { useSettingsStore } from '../../settings/store.js';
import { getNoteMarkers } from './noteMarker.js';
import { NoteScaleMarker } from './NoteScaleMarker.js';

export const SpectrogramNoteScale: FC = () => {
  const minFrequency = useSettingsStore((state) => state.minFrequency);
  const maxFrequency = useSettingsStore((state) => state.maxFrequency);

  const markers = useMemo(
    () => getNoteMarkers(minFrequency, maxFrequency),
    [maxFrequency, minFrequency],
  );

  return (
    <Box
      position='absolute'
      top={0}
      right={0}
      bottom={0}
      left={0}
      sx={{ pointerEvents: 'none' }}
    >
      {markers.map((marker) => (
        <NoteScaleMarker key={marker.midi} {...marker} />
      ))}
    </Box>
  );
};
