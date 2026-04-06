import { useTheme } from '@mui/material';
import { type ViewColors } from '@musetric/audio';
import { useLayoutEffect } from 'react';
import { useSettingsStore } from './store.js';

export const useThemeViewColors = () => {
  const theme = useTheme();
  const setColors = useSettingsStore((s) => s.setColors);

  useLayoutEffect(() => {
    const colors: ViewColors = {
      played: theme.palette.primary.main,
      unplayed: theme.palette.default.main,
      background: theme.palette.background.default,
    };
    setColors(colors);
  }, [theme, setColors]);
};
