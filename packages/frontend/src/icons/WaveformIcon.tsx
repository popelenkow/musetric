import { SvgIcon, type SvgIconProps } from '@mui/material';

export const WaveformIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d='M4 10.5v3M7.5 7.5v9M11 5.5v13M14.5 8.5v7M18 6.5v11M21 10.5v3'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2.4}
    />
  </SvgIcon>
);
