import { Box, Stack } from '@mui/material';
import { type api } from '@musetric/api';
import { type FC, useEffect } from 'react';
import { useDecoderStore } from '../../domain/decoder/store.js';
import { Player } from '../../domain/player/Player.js';
import { usePlayerStore } from '../../domain/player/store.js';
import { ProjectSettings } from '../../domain/settings/field/ProjectSettings.js';
import { SpectrogramCanvas } from '../../domain/spectrogram/SpectrogramCanvas.js';
import { Subtitle } from '../../domain/subtitle/view.js';
import { WaveformCanvas } from '../../domain/waveform/WaveformCanvas.js';
import { ProjectBackButton } from './ProjectBackButton.js';
import { ProjectLayout } from './ProjectPageLayout.js';

export type ProjectViewProps = {
  project: api.project.Item;
};
export const ProjectView: FC<ProjectViewProps> = (props) => {
  const { project } = props;

  const player = usePlayerStore((s) => s.player);
  const initDecoder = useDecoderStore((s) => s.init);

  useEffect(() => {
    if (!player) return;
    return initDecoder(project.id, player.context.sampleRate);
  }, [initDecoder, project.id, player]);

  return (
    <ProjectLayout
      heading={
        <>
          <ProjectBackButton />
          <Box flexGrow={1} />
          <ProjectSettings />
        </>
      }
    >
      <Stack
        padding={4}
        width='100%'
        flexGrow={1}
        sx={{
          scrollbarGutter: 'stable',
        }}
      >
        <Box width='100%' flexGrow={1} flexBasis={0} minHeight={0}>
          <SpectrogramCanvas />
        </Box>
        <Box height='80px' width='100%'>
          <WaveformCanvas projectId={project.id} type='lead' />
        </Box>
        <Subtitle projectId={project.id} />
        <Player />
      </Stack>
    </ProjectLayout>
  );
};
