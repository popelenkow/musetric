import { SvgIcon, type SvgIconProps } from '@mui/material';

export const TempoIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d='M4 15a8 8 0 1 1 16 0'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeWidth={2}
    />
    <path
      d='M12 15l4-5'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeWidth={2.2}
    />
    <circle cx={12} cy={15} r={1.7} fill='currentColor' />
  </SvgIcon>
);
