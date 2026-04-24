import { IconButton, Stack, Typography } from '@mui/material';
import { type FC, useState } from 'react';
import { useEngineStore } from '../../../engine/useEngineStore.js';
import { PitchShiftIcon } from '../../../icons/PitchShiftIcon.js';
import { PitchShiftSheet } from './PitchShiftSheet.js';

export const PitchShiftControl: FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();
  const frameCount = useEngineStore((state) => state.frameCount);
  const transposeSemitones = useEngineStore(
    (state) => state.transposeSemitones,
  );
  const disabled = !frameCount;
  const displayValue =
    transposeSemitones > 0
      ? `+${transposeSemitones}`
      : String(transposeSemitones);
  const valueLabel = `${displayValue} st`;

  return (
    <>
      <Stack alignItems='center' justifyContent='center'>
        <IconButton
          color={transposeSemitones !== 0 ? 'primary' : 'inherit'}
          disabled={disabled}
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
          }}
        >
          <PitchShiftIcon fontSize='small' />
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
      <PitchShiftSheet
        anchorEl={anchorEl}
        disabled={disabled}
        transposeSemitones={transposeSemitones}
        onClose={() => {
          setAnchorEl(undefined);
        }}
      />
    </>
  );
};
