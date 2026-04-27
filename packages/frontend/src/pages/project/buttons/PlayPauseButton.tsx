import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { IconButton, Tooltip } from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { engine } from '../../../engine/engine.js';
import { useEngineStore } from '../../../engine/useEngineStore.js';

export const PlayPauseButton: FC = () => {
  const { t } = useTranslation();
  const frameCount = useEngineStore((state) => state.frameCount);
  const playing = useEngineStore((state) => state.playing);
  const playPauseButtonLabel = playing
    ? t('pages.project.player.controls.pause')
    : t('pages.project.player.controls.play');

  return (
    <Tooltip title={playPauseButtonLabel}>
      <span>
        <IconButton
          onClick={playing ? engine.player.pause : engine.player.play}
          size='small'
          sx={{ p: 0 }}
          disabled={!frameCount}
        >
          {playing ? (
            <PauseCircleIcon fontSize='large' />
          ) : (
            <PlayCircleIcon fontSize='large' />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
};
