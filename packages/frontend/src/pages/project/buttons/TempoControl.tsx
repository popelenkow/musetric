import { IconButton, Stack, Typography } from '@mui/material';
import { type FC, useState } from 'react';
import { useEngineStore } from '../../../engine/useEngineStore.js';
import { TempoIcon } from '../../../icons/TempoIcon.js';
import { TempoShiftSheet } from './TempoShiftSheet.js';

export const TempoControl: FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();
  const frameCount = useEngineStore((state) => state.frameCount);
  const sourceTempoBpm = useEngineStore((state) => state.sourceTempoBpm);
  const tempoBpm = useEngineStore((state) => state.tempoBpm);
  const disabled = !frameCount;
  const valueLabel = String(tempoBpm);

  return (
    <>
      <Stack alignItems='center' justifyContent='center'>
        <IconButton
          color={tempoBpm !== sourceTempoBpm ? 'primary' : 'inherit'}
          disabled={disabled}
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
          }}
        >
          <TempoIcon fontSize='small' />
        </IconButton>
        <Typography
          component='span'
          variant='caption'
          fontWeight={700}
          lineHeight={1}
          sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {valueLabel}
        </Typography>
      </Stack>
      <TempoShiftSheet
        anchorEl={anchorEl}
        disabled={disabled}
        sourceTempoBpm={sourceTempoBpm}
        tempoBpm={tempoBpm}
        onClose={() => {
          setAnchorEl(undefined);
        }}
      />
    </>
  );
};
