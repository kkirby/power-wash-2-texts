// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

const repository = process.env.GITHUB_REPOSITORY;
const repoName = repository && repository.includes('/') ? repository.split('/')[1] : undefined;
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
const isUserOrOrgPagesRepo =
  !!owner && !!repoName && `${owner}.github.io`.toLowerCase() === repoName.toLowerCase();
const base = isGitHubActions && repoName && !isUserOrOrgPagesRepo ? `/${repoName}/` : '/';

const site = process.env.SITE_URL ?? 'https://powerwash2.pages.dev';

export default defineConfig({
  integrations: [react(), sitemap()],
  output: 'static',
  site,
  base,
  vite: {
    ssr: {
      noExternal: ['@mantine/core', '@mantine/hooks', '@mantine/notifications'],
    },
  },
});