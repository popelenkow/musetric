import { Box } from '@mui/material';
import { type FourierMode } from '@musetric/audio';
import { type FC, useEffect, useRef } from 'react';
import { canvasHeight, canvasWidth } from '../constants.js';
import { type MetricsData, runBenchmark } from '../runBenchmarks.js';

export type BenchmarkRunnerProps = {
  fourierMode: FourierMode;
  windowSize: number;
  onUpdate: (data: MetricsData) => void;
};
export const BenchmarkRunner: FC<BenchmarkRunnerProps> = (props) => {
  const { onUpdate, fourierMode, windowSize } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isRendering = useRef(false);

  useEffect(() => {
    if (isRendering.current) return;
    isRendering.current = true;

    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    const run = async () => {
      const metrics = await runBenchmark(canvas, fourierMode, windowSize);
      onUpdate(metrics);
      isRendering.current = false;
    };
    void run();
  }, [onUpdate, fourierMode, windowSize]);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        key={`${fourierMode}-${windowSize}`}
        width={canvasWidth}
        height={canvasHeight}
      />
    </Box>
  );
};
