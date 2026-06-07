import { Box, Text, Stack, Badge, Divider, Paper } from '@mantine/core';
import { MessageBubble } from './MessageBubble';
import type { Level } from '../utils/types';

interface Props {
  level: Level;
}

function ProgressLabel({ progress, label }: { progress: string; label?: string }) {
  const isPercent = /^\d+%/.test(progress);
  const isNamed = !isPercent && progress !== 'Overview';

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '16px 0 12px',
      }}
    >
      <Divider style={{ flex: 1 }} color="#333" />
      <Badge
        variant="light"
        color={isNamed ? 'blue' : 'gray'}
        size="sm"
        radius="sm"
        style={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}
      >
        {isPercent ? `📍 ${progress}` : isNamed ? `📋 ${progress}` : progress}
        {label ? ` — ${label}` : ''}
      </Badge>
      <Divider style={{ flex: 1 }} color="#333" />
    </Box>
  );
}

export function MessageThread({ level }: Props) {
  return (
    <Box p="md" style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Level header */}
      <Box mb="xl" ta="center">
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
          {level.sectionName}
        </Text>
        <Text fw={700} size="xl" c="white">
          {level.name}
        </Text>
      </Box>

      {level.points.map((point, pi) => (
        <Box key={pi}>
          <ProgressLabel progress={point.progress} label={point.label} />

          {point.blocks.map((block, bi) => (
            <Box key={bi} mb="md">
              {block.groupName && (
                <Paper
                  p="xs"
                  mb={8}
                  radius="sm"
                  style={{
                    background: '#1a1a2e',
                    border: '1px solid #2a2a4a',
                  }}
                >
                  <Text size="xs" c="blue.4" fw={700} tt="uppercase" style={{ letterSpacing: '0.05em' }}>
                    💬 {block.groupName}
                  </Text>
                </Paper>
              )}
              <Stack gap={10} pl={block.groupName ? 'md' : 0}>
                {block.messages.map((msg, mi) => (
                  <MessageBubble key={mi} message={msg} isInGroup={!!block.groupName} />
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}
