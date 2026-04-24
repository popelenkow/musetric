import '@ncdai/react-wheel-picker/style.css';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  Box,
  Button,
  Drawer,
  Popover,
  Stack,
  type Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  maxPitchShiftSemitones,
  minPitchShiftSemitones,
} from '@musetric/audio';
import {
  WheelPicker,
  type WheelPickerOption,
  WheelPickerWrapper,
} from '@ncdai/react-wheel-picker';
import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { engine } from '../../../engine/engine.js';

const optionItemHeight = 40;
const visibleOptionCount = 16;
const wheelHeight = 224;

const formatPitchOption = (value: number) =>
  `${value > 0 ? `+${value}` : value} st`;

type PitchShiftSheetProps = {
  anchorEl?: HTMLElement;
  disabled: boolean;
  onClose: () => void;
  transposeSemitones: number;
};

export const PitchShiftSheet: FC<PitchShiftSheetProps> = (props) => {
  const { anchorEl, disabled, onClose, transposeSemitones } = props;
  const { t } = useTranslation();
  const desktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
  const options = useMemo<WheelPickerOption<number>[]>(
    () =>
      Array.from(
        {
          length: maxPitchShiftSemitones - minPitchShiftSemitones + 1,
        },
        (_, index) => {
          const optionValue = maxPitchShiftSemitones - index;

          return {
            label: formatPitchOption(optionValue),
            textValue: formatPitchOption(optionValue),
            value: optionValue,
          };
        },
      ),
    [],
  );

  const content = (
    <Stack gap={2.5}>
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='center'
        gap={2}
      >
        <Typography variant='h6' fontWeight={800} lineHeight={1.15}>
          {t('pages.project.player.controls.songKey')}
        </Typography>
      </Stack>
      <Box
        display='grid'
        gridTemplateColumns='minmax(0, 1fr)'
        alignItems='center'
        minHeight={wheelHeight}
      >
        <Box
          height={wheelHeight}
          minWidth={0}
          flex={1}
          sx={{
            pointerEvents: disabled ? 'none' : undefined,
            opacity: disabled ? 0.46 : 1,
            transition: 'opacity 160ms ease',
            '[data-rwp]': {
              cursor: disabled ? 'default' : 'grab',
            },
            '[data-rwp]:active': {
              cursor: disabled ? 'default' : 'grabbing',
            },
            '.value-wheel-option': {
              color: 'text.secondary',
              fontSize: 15,
              fontWeight: 650,
              letterSpacing: 0,
              fontVariantNumeric: 'tabular-nums',
            },
            '.value-wheel-highlight-wrapper': {
              height: optionItemHeight,
              borderRadius: 1.5,
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
            },
            '.value-wheel-highlight': {
              height: optionItemHeight,
              color: 'primary.contrastText',
              bgcolor: 'primary.main',
              borderRadius: 1.5,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: 0,
              fontVariantNumeric: 'tabular-nums',
              boxShadow: '0 10px 28px rgba(144, 202, 249, 0.22)',
            },
          }}
        >
          <WheelPickerWrapper>
            <WheelPicker
              value={transposeSemitones}
              options={options}
              visibleCount={visibleOptionCount}
              optionItemHeight={optionItemHeight}
              classNames={{
                highlightItem: 'value-wheel-highlight',
                highlightWrapper: 'value-wheel-highlight-wrapper',
                optionItem: 'value-wheel-option',
              }}
              onValueChange={(value) => {
                engine.store.update((state) => {
                  state.transposeSemitones = value;
                });
              }}
            />
          </WheelPickerWrapper>
        </Box>
      </Box>
      <Button
        size='large'
        variant='outlined'
        startIcon={<RestartAltIcon />}
        disabled={disabled || transposeSemitones === 0}
        onClick={() => {
          engine.store.update((state) => {
            state.transposeSemitones = 0;
          });
        }}
        sx={{
          fontWeight: 800,
          borderColor: 'rgba(255, 255, 255, 0.14)',
          color: 'text.primary',
          bgcolor: 'rgba(255, 255, 255, 0.04)',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.22)',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        {t('pages.project.player.controls.pitchReset')}
      </Button>
    </Stack>
  );

  if (desktop) {
    return (
      <Popover
        open={anchorEl !== undefined}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          horizontal: 'center',
          vertical: 'top',
        }}
        transformOrigin={{
          horizontal: 'center',
          vertical: 'bottom',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 340,
              bgcolor: '#1d1f22',
              backgroundImage:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 42%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 2,
              boxShadow: '0 18px 50px rgba(0, 0, 0, 0.42)',
              p: 2.5,
            },
          },
        }}
      >
        {content}
      </Popover>
    );
  }

  return (
    <Drawer
      anchor='bottom'
      open={anchorEl !== undefined}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.62)',
            backdropFilter: 'blur(3px)',
          },
        },
        paper: {
          sx: {
            width: '100%',
            maxWidth: 460,
            mx: 'auto',
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
            bgcolor: '#1d1f22',
            backgroundImage:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 42%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: 0,
            px: { xs: 2.5, sm: 3 },
            pt: 1.5,
            pb: 'max(18px, env(safe-area-inset-bottom))',
          },
        },
      }}
    >
      {content}
    </Drawer>
  );
};
