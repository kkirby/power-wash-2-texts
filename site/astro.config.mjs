// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const isUserOrOrgPagesRepo =
  !!owner && !!repoName && `${owner}.github.io`.toLowerCase() === repoName.toLowerCase();
const base = process.env.GITHUB_ACTIONS && repoName && !isUserOrOrgPagesRepo ? `/${repoName}/` : '/';

export default defineConfig({
  integrations: [react()],
  output: 'static',
  base,
  vite: {
    ssr: {
      noExternal: ['@mantine/core', '@mantine/hooks', '@mantine/notifications'],
    },
  },
});
