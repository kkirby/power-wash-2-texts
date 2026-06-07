import type { Level, MessageBlock, ProgressPoint, SingleMessage, SiteSection } from './types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Unescape markdown backslash escapes like \!, \[, \], \\, \*, etc.
function unescapeMarkdown(text: string): string {
  return text.replace(/\\([\\`*_{}\[\]()#+\-.!|>])/g, '$1');
}

// Strip markdown bold/italic markers and trailing colons from raw text
function cleanText(raw: string): string {
  return unescapeMarkdown(
    raw
      .replace(/\*\*/g, '')
      .replace(/^\*(.+)\*$/, '$1')
      .replace(/:$/, '')
      .trim()
  );
}

// Remove leading bullet "* " or "- " from a line
function stripBullet(line: string): string {
  return unescapeMarkdown(line.replace(/^\s*[-*]\s+/, '').trim());
}

export function parseMarkdown(md: string): SiteSection[] {
  const lines = md.split('\n');
  const sections: SiteSection[] = [];

  let currentSection: SiteSection | null = null;
  let currentLevel: Level | null = null;
  let currentPoint: ProgressPoint | null = null;
  let currentBlock: MessageBlock | null = null;
  let currentMessage: SingleMessage | null = null;

  function flushMessage() {
    if (currentMessage && currentBlock) {
      if (currentMessage.lines.length > 0) {
        currentBlock.messages.push(currentMessage);
      }
      currentMessage = null;
    }
  }

  function flushBlock() {
    flushMessage();
    if (currentBlock && currentPoint) {
      if (currentBlock.messages.length > 0) {
        currentPoint.blocks.push(currentBlock);
      }
      currentBlock = null;
    }
  }

  function flushPoint() {
    flushBlock();
    if (currentPoint && currentLevel) {
      if (currentPoint.blocks.length > 0) {
        currentLevel.points.push(currentPoint);
      }
      currentPoint = null;
    }
  }

  function flushLevel() {
    flushPoint();
    if (currentLevel && currentSection) {
      if (currentLevel.points.length > 0) {
        currentSection.levels.push(currentLevel);
      }
      currentLevel = null;
    }
  }

  function ensureBlock() {
    if (!currentBlock) {
      currentBlock = { messages: [] };
    }
  }

  function ensurePoint(progress: string, label?: string) {
    if (currentPoint?.progress !== progress) {
      flushBlock();
      if (!currentPoint || currentPoint.progress !== progress) {
        flushPoint();
        currentPoint = { progress, label, blocks: [] };
      }
    }
    ensureBlock();
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // H1 = top-level section (Career, Caldera Chronicles, Adventure Time DLC)
    if (/^# \*\*/.test(trimmed)) {
      flushLevel();
      const match = trimmed.match(/^# \*\*(.+?)\*\*/);
      if (match) {
        const sectionName = cleanText(match[1]);
        currentSection = { name: sectionName, levels: [] };
        sections.push(currentSection);
      }
      continue;
    }

    // H2 = Level name
    if (/^## \*\*/.test(trimmed)) {
      flushLevel();
      if (!currentSection) {
        currentSection = { name: 'Career', levels: [] };
        sections.push(currentSection);
      }
      const match = trimmed.match(/^## \*\*(.+?)\*\*/);
      if (match) {
        const levelName = cleanText(match[1]);
        currentLevel = {
          id: slugify(levelName),
          name: levelName,
          sectionName: currentSection.name,
          points: [],
        };
      }
      continue;
    }

    if (!currentLevel) continue;

    // H3 = Introduction / Level Overview / Completion / Job Overview etc.
    if (/^### /.test(trimmed)) {
      flushBlock();
      flushPoint();
      const match = trimmed.match(/^###\s+\*?\*?(.+?)\*?\*?\s*(?:\{.*?\})?$/);
      if (match) {
        const label = cleanText(match[1]);
        if (label) {
          currentPoint = { progress: label, blocks: [] };
        }
      }
      continue;
    }

    // H4 = Progress milestones like #### **20%** or #### **20% - Stage 1 completion**
    if (/^#### /.test(trimmed)) {
      flushBlock();
      // Don't flush point here - keep the same point container but add a sub-progress marker
      const match = trimmed.match(/^####\s+\*?\*?(.+?)\*?\*?$/);
      if (match) {
        const raw = cleanText(match[1]);
        // Split on " - " or " – " to get percentage and optional label
        const parts = raw.split(/\s*[-–]\s*/);
        const progress = parts[0].trim();
        const label = parts.slice(1).join(' - ').trim() || undefined;

        flushPoint();
        currentPoint = { progress, label, blocks: [] };
        ensureBlock();
      }
      continue;
    }

    if (!currentPoint) {
      // Default point for content before any h3/h4
      currentPoint = { progress: 'Overview', blocks: [] };
      ensureBlock();
    }

    // Group chat header: **Name:** (bold line starting with **)
    const groupMatch = trimmed.match(/^\*\*([^*]+):\*\*$/);
    if (groupMatch) {
      flushMessage();
      flushBlock();
      ensurePoint(currentPoint.progress, currentPoint.label);
      currentBlock = { groupName: cleanText(groupMatch[1]), messages: [] };
      continue;
    }

    // Sender line: *Name:* (italic line, entire line is italic with colon)
    // Pattern: *Name:* or *Name, Subtitle:*
    const senderMatch = trimmed.match(/^\*([^*]+):\*$/);
    if (senderMatch) {
      flushMessage();
      ensureBlock();
      const sender = cleanText(senderMatch[1]);
      currentMessage = { sender, lines: [] };
      continue;
    }

    // Special: "*Name has left the chat*" type lines
    const leftChatMatch = trimmed.match(/^\*(.+has left the chat)\*$/);
    if (leftChatMatch) {
      // Treat as a system message
      flushMessage();
      ensureBlock();
      currentMessage = { sender: 'system', lines: [cleanText(leftChatMatch[1])] };
      flushMessage();
      continue;
    }

    // Bullet line - message content
    if (/^\s*\*\s+/.test(line) && currentMessage) {
      const content = stripBullet(line);
      if (content) {
        currentMessage.lines.push(content);
      }
      continue;
    }

    // Continuation text without bullet (indented continuation)
    if (trimmed && currentMessage && !/^[#*]/.test(trimmed)) {
      // Could be continuation of a message block
      // Only add if it's not a structural element
      if (!/^\*\*/.test(trimmed) && !/^\*[^*]/.test(trimmed)) {
        currentMessage.lines.push(trimmed);
      }
    }
  }

  flushLevel();

  return sections.filter(s => s.levels.length > 0);
}
