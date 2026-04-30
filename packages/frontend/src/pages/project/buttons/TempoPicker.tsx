import { Box, Drawer, Popover, type Theme, useMediaQuery } from '@mui/material';
import { type FC } from 'react';
import { useProjectStore } from '../store.js';
import { TempoPickerContent } from './TempoPickerContent.js';

export const TempoPicker: FC = () => {
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
  const tempoAnchorEl = useProjectStore((state) => state.tempoAnchorEl);
  const setTempoAnchorEl = useProjectStore((state) => state.setTempoAnchorEl);

  if (isDesktop) {
    return (
      <Popover
        open={tempoAnchorEl !== undefined}
        anchorEl={tempoAnchorEl}
        onClose={() => {
          setTempoAnchorEl(undefined);
        }}
        anchorOrigin={{
          horizontal: 'center',
          vertical: 'top',
        }}
        transformOrigin={{
          horizontal: 'center',
          vertical: 'bottom',
        }}
      >
        <Box width={340} p={2}>
          <TempoPickerContent />
        </Box>
      </Popover>
    );
  }

  return (
    <Drawer
      anchor='bottom'
      open={tempoAnchorEl !== undefined}
      onClose={() => {
        setTempoAnchorEl(undefined);
      }}
    >
      <Box
        width='100%'
        maxWidth={460}
        mx='auto'
        p={2}
        pb='max(18px, env(safe-area-inset-bottom))'
      >
        <TempoPickerContent />
      </Box>
    </Drawer>
  );
};
