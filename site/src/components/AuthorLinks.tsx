import { Anchor, type AnchorProps } from '@mantine/core';
import { AUTHOR } from '../utils/author';

export function AuthorLink(props: Omit<AnchorProps, 'href'>) {
  return (
    <Anchor href={AUTHOR.url} target="_blank" rel="noopener noreferrer" {...props}>
      {AUTHOR.name}
    </Anchor>
  );
}

export function SourceDocLink({ children, ...props }: Omit<AnchorProps, 'href'>) {
  return (
    <Anchor href={AUTHOR.sourceDocUrl} target="_blank" rel="noopener noreferrer" {...props}>
      {children ?? 'Google Doc'}
    </Anchor>
  );
}
