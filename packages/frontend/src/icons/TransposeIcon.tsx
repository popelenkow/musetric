import { SvgIcon, type SvgIconProps } from '@mui/material';

export const TransposeIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d='M2.3 6.6h19.4M2.3 13.1h8.65M16.3 13.1h5.4M2.3 19.6h19.4'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeWidth={2}
      opacity={0.58}
    />
    <path
      d='M13.62 16.59c0 1.64-1.58 2.97-3.51 2.97S6.6 18.23 6.6 16.59s1.58-2.97 3.51-2.97s3.51 1.33 3.51 2.97Z'
      fill='currentColor'
    />
    <path
      d='M13.62 16.59V7.68'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2.35}
    />
  </SvgIcon>
);
