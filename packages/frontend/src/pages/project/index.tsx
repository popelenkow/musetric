import { apiError } from '@musetric/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type FC, useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { endpoints } from '../../api/index.js';
import { routes } from '../../app/router/routes.js';
import { ViewError } from '../../components/ViewError.js';
import { ViewPending } from '../../components/ViewPending.js';
import { ProjectProgressFlow } from './Flow/ProjectProgressFlow.js';
import { ProjectLayout } from './ProjectPageLayout.js';
import { ProjectView } from './ProjectView.js';
import { useThemeViewColors } from './settings/theme.js';
import { useWorkersStore } from './workersStore.js';

export const ProjectPage: FC = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  useThemeViewColors();

  const { projectId } = routes.project.useAssertMatch();

  const mount = useWorkersStore((s) => s.mount);
  useLayoutEffect(() => mount(), [mount]);

  const project = useQuery(endpoints.project.get(projectId));
  useEffect(
    () => endpoints.project.subscribeToStatus(queryClient),
    [queryClient],
  );

  if (project.status === 'error') {
    const errorMessage = apiError.getMessage(project.error);

    return (
      <ProjectLayout>
        <ViewError
          message={errorMessage ?? t('pages.project.progress.error.project')}
        />
      </ProjectLayout>
    );
  }

  if (project.status === 'pending') {
    return (
      <ProjectLayout>
        <ViewPending message={t('pages.project.progress.loading')} />
      </ProjectLayout>
    );
  }

  if (!project.data.processing.done) {
    return <ProjectProgressFlow project={project.data} />;
  }

  return <ProjectView project={project.data} />;
};
