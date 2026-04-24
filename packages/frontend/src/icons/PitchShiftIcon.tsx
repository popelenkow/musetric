import { SvgIcon, type SvgIconProps } from '@mui/material';

export const PitchShiftIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d='M3 7h18M3 13h8M16 13h5M3 19h18'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeWidth={2}
      opacity={0.58}
    />
    <path
      d='M13.5 18.25c0 1.52-1.46 2.75-3.25 2.75S7 19.77 7 18.25s1.46-2.75 3.25-2.75s3.25 1.23 3.25 2.75Z'
      fill='currentColor'
    />
    <path
      d='M13.5 18.25V10'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2.35}
    />
  </SvgIcon>
);
