import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { IconButton } from '@mui/material';
import { type FC } from 'react';
import { engine } from '../../../engine/engine.js';
import { useEngineStore } from '../../../engine/useEngineStore.js';

export const Player: FC = () => {
  const frameCount = useEngineStore((state) => state.frameCount);
  const playing = useEngineStore((state) => state.playing);

  return (
    <IconButton
      onClick={playing ? engine.player.pause : engine.player.play}
      disabled={!frameCount}
      sx={{ alignSelf: 'center' }}
    >
      {playing ? <PauseIcon /> : <PlayArrowIcon />}
    </IconButton>
  );
};
