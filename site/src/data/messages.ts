import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseMarkdown } from '../utils/parseMarkdown';
import type { SiteSection } from '../utils/types';

const mdPath = resolve(process.cwd(), '..', 'PowerWash Simulator 2 Messages.md');
const md = readFileSync(mdPath, 'utf-8');

export const siteData: SiteSection[] = parseMarkdown(md);
