import { Box } from '@mui/material';
import { type FC } from 'react';
import { ProjectDetails } from './ProjectDetails.js';
import { ProjectVisualization } from './ProjectVisualization.js';

export const ProjectContent: FC = () => {
  return (
    <Box
      display='grid'
      width='100%'
      flexGrow={1}
      minHeight={0}
      gap={1}
      overflow='hidden'
      gridTemplateColumns={{
        xs: 'minmax(0, 1fr)',
        md: 'minmax(0, 1fr) 460px',
      }}
      gridTemplateRows={{
        xs: 'minmax(0, 1fr) minmax(0, 1fr)',
        md: 'minmax(0, 1fr)',
      }}
      gridTemplateAreas={{
        xs: `
          "details"
          "visualization"
        `,
        md: '"visualization details"',
      }}
    >
      <ProjectDetails />
      <ProjectVisualization />
    </Box>
  );
};
