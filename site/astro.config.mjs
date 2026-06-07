// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  output: 'static',
  vite: {
    ssr: {
      noExternal: ['@mantine/core', '@mantine/hooks', '@mantine/notifications'],
    },
  },
});
