import { SvgIcon, type SvgIconProps } from '@mui/material';

export const LyricsTextIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d='M5 6h9M9.5 6v10'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
    />
    <path
      d='M14.5 11H20M14.5 15H20M5 19h15'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeWidth={1.7}
      opacity={0.72}
    />
  </SvgIcon>
);
