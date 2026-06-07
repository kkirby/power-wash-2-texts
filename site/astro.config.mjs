// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/';

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
