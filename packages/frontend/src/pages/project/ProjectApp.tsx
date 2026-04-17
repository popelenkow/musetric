import { Box, Stack } from '@mui/material';
import { type api } from '@musetric/api';
import { type FC, useEffect } from 'react';
import { engine } from '../../engine/engine.js';
import { PlaybackPanel } from './player/PlaybackPanel.js';
import { ProjectBackButton } from './ProjectBackButton.js';
import { ProjectLayout } from './ProjectPageLayout.js';
import { ProjectSettings } from './settings/field/ProjectSettings.js';
import { subscribeSettingsStore } from './settings/store.js';
import { subscribeProjectStore } from './store.js';
import { Subtitle } from './subtitle/Subtitle.js';
import { ProjectMainContent } from './waveform/ProjectMainContent.js';

export type ProjectAppProps = {
  project: api.project.Item;
};
export const ProjectApp: FC<ProjectAppProps> = (props) => {
  const { project } = props;

  useEffect(() => {
    const unsubscribeSettingsStore = subscribeSettingsStore();
    const unsubscribeProjectStore = subscribeProjectStore();

    return () => {
      unsubscribeSettingsStore();
      unsubscribeProjectStore();
    };
  }, []);

  useEffect(() => engine.decoder.mount(project.id), [project.id]);

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
        width='100%'
        flexGrow={1}
        minHeight={0}
        gap={2}
        sx={{
          scrollbarGutter: 'stable',
        }}
      >
        <ProjectMainContent projectId={project.id} />
        <Subtitle projectId={project.id} />
        <PlaybackPanel />
      </Stack>
    </ProjectLayout>
  );
};
