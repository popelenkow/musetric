import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { IconButton } from '@mui/material';
import { type FC } from 'react';
import { usePlayerStore } from './store.js';

export const Player: FC = () => {
  const playing = usePlayerStore((s) => s.playing);
  const bufferLength = usePlayerStore((s) => s.bufferLength);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);

  return (
    <IconButton
      onClick={playing ? pause : play}
      disabled={!bufferLength}
      sx={{ alignSelf: 'center' }}
    >
      {playing ? <PauseIcon /> : <PlayArrowIcon />}
    </IconButton>
  );
};
