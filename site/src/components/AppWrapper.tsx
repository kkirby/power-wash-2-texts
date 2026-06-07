import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import { App } from './App';
import type { SiteSection } from '../utils/types';

const theme = createTheme({
  colorScheme: 'dark',
  primaryColor: 'blue',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

interface Props {
  sections: SiteSection[];
}

export function AppWrapper({ sections }: Props) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <App sections={sections} />
    </MantineProvider>
  );
}
