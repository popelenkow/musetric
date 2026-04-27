import { SvgIcon, type SvgIconProps } from '@mui/material';

export const SpectrogramIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d='M4 7.5c2-1 4 1 6 0s4-1 6 0s3.2.9 4.5 0'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.45}
      opacity={0.72}
    />
    <path
      d='M3.75 12c2.1-1.45 4.2 1.45 6.3 0s4.2-1.45 6.3 0c1.45 1 2.75 1 4.15 0'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.75}
      opacity={0.86}
    />
    <path
      d='M3.5 17c2.25-2 4.5 2 6.75 0s4.5-2 6.75 0c1.25 1.1 2.35 1.1 3.5 0'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2.35}
    />
  </SvgIcon>
);
