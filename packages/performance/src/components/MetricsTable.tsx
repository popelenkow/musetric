import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { type FourierMode } from '@musetric/audio';
import { type FC } from 'react';
import { getTimerLabels, windowSizes } from '../constants.js';
import { getMetric } from '../getMetric.js';
import type { MetricsData } from '../runBenchmarks.js';

export type MetricsTableProps = {
  mode: FourierMode;
  results: Record<number, MetricsData>;
  showFirst: boolean;
  showPercent: boolean;
  showDeviations: boolean;
};
export const MetricsTable: FC<MetricsTableProps> = (props) => {
  const { mode, results, showFirst, showPercent, showDeviations } = props;

  const metrics = getTimerLabels(mode);
  const theme = useTheme();
  const divider = `1px solid ${theme.palette.divider}`;
  const stickyBorder = {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '1px',
    backgroundColor: theme.palette.divider,
    zIndex: 2,
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        my: 1,
        overflowX: 'auto',
        position: 'relative',
        '& .MuiTable-root': {
          minWidth: 'max-content',
        },
      }}
    >
      <Table
        size='small'
        sx={{
          width: '100%',
          fontSize: '0.75rem',
        }}
      >
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.grey[800] }}>
            <TableCell
              sx={{
                borderRight: divider,
                fontWeight: 'bold',
                width: '150px',
                position: 'sticky',
                left: 0,
                zIndex: 1,
                backgroundColor: theme.palette.grey[800],
                '&::after': stickyBorder,
              }}
            >
              {'windowSize'}
            </TableCell>
            {windowSizes.map((windowSize, idx) => (
              <TableCell
                key={windowSize}
                align='right'
                sx={{
                  borderRight: idx < windowSizes.length - 1 ? divider : 'none',
                  fontWeight: 'bold',
                  minWidth: '110px',
                }}
              >
                {windowSize}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {metrics.map((metric, metricIdx) => (
            <TableRow
              key={metric}
              sx={{
                backgroundColor:
                  metricIdx % 2 === 1
                    ? theme.palette.grey[800]
                    : theme.palette.grey[900],
              }}
            >
              <TableCell
                component='th'
                scope='row'
                sx={{
                  borderRight: divider,
                  position: 'sticky',
                  left: 0,
                  backgroundColor:
                    metricIdx % 2 === 1
                      ? theme.palette.grey[800]
                      : theme.palette.grey[900],
                  zIndex: 1,
                  '&::after': stickyBorder,
                }}
              >
                {metric}
              </TableCell>
              {windowSizes.map((windowSize, idx) => {
                const data = results[windowSize];
                const value = getMetric(
                  data,
                  metric,
                  showFirst,
                  showPercent,
                  showDeviations,
                );
                return (
                  <TableCell
                    key={windowSize}
                    align='right'
                    sx={{
                      borderRight:
                        idx < windowSizes.length - 1 ? divider : 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {typeof value === 'string' ? value : value?.toFixed(2)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
