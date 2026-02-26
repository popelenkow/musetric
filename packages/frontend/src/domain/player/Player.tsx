import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { IconButton } from '@mui/material';
import { type FC } from 'react';
import { usePlayerStore } from './store.js';

export const Player: FC = () => {
  const playing = usePlayerStore((s) => s.playing);
  const frameCount = usePlayerStore((s) => s.frameCount);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);

  return (
    <IconButton
      onClick={playing ? pause : play}
      disabled={!frameCount}
      sx={{ alignSelf: 'center' }}
    >
      {playing ? <PauseIcon /> : <PlayArrowIcon />}
    </IconButton>
  );
};
