import { Box, Text, Stack } from '@mantine/core';
import type { SingleMessage } from '../utils/types';

const SENDER_COLORS: Record<string, string> = {};
const PALETTE = [
  '#2196F3', '#4CAF50', '#FF5722', '#9C27B0', '#00BCD4',
  '#FF9800', '#795548', '#607D8B', '#E91E63', '#009688',
  '#673AB7', '#3F51B5', '#F44336', '#CDDC39', '#FFC107',
];
let colorIdx = 0;

function getSenderColor(sender: string): string {
  if (sender === 'system') return '#888';
  if (!SENDER_COLORS[sender]) {
    SENDER_COLORS[sender] = PALETTE[colorIdx % PALETTE.length];
    colorIdx++;
  }
  return SENDER_COLORS[sender];
}

// Determine if this sender is the "player" (right-aligned bubble)
// The game calls you by many names — Wishy, Sprucey, Dirtfinder, etc.
// We simply treat unrecognized short senders as NPCs. The player has no sender line.
function isSystemMsg(sender: string): boolean {
  return sender === 'system';
}

interface Props {
  message: SingleMessage;
  isInGroup: boolean;
}

export function MessageBubble({ message, isInGroup }: Props) {
  const color = getSenderColor(message.sender);

  if (isSystemMsg(message.sender)) {
    return (
      <Box ta="center" py={4}>
        <Text size="xs" c="dimmed" fs="italic">
          {message.lines.join(' ')}
        </Text>
      </Box>
    );
  }

  return (
    <Box mb={6}>
      <Text size="xs" fw={600} c={color} mb={2} ml={2}>
        {message.sender}
      </Text>
      <Stack gap={4}>
        {message.lines.map((line, i) => (
          <Box
            key={i}
            style={{
              display: 'inline-block',
              maxWidth: '75%',
              background: '#1c1c1e',
              borderRadius: '18px',
              borderTopLeftRadius: '4px',
              padding: '8px 14px',
              border: `1px solid ${color}33`,
            }}
          >
            <Text size="sm" c="white" style={{ lineHeight: 1.5 }}>
              {line}
            </Text>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
