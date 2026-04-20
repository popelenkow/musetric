import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { IconButton, Tooltip } from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { engine } from '../../../../engine/engine.js';
import { useEngineStore } from '../../../../engine/useEngineStore.js';

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
          disabled={!frameCount}
          aria-label={playPauseButtonLabel}
        >
          {playing ? (
            <PauseIcon fontSize='small' />
          ) : (
            <PlayArrowIcon fontSize='small' />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
};
