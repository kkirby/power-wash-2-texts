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

// Known typo corrections — verbatim game-text errors only.
// Intentional British spellings (practise, recognise, colour …) and character
// voice quirks are left untouched.
const TYPO_CORRECTIONS: [RegExp, string][] = [
  [/\bisntalled\b/g, 'installed'],                                        // Public Facility
  [/messages from and old friend/g, 'messages from an old friend'],       // Temple Interior
  [/When works\?/g, 'When works for you?'],                               // Streetcar intro
  [/already by overly-familiar/g, 'already be overly-familiar'],          // Motel
];

function applyCorrections(text: string): string {
  let out = text;
  for (const [re, replacement] of TYPO_CORRECTIONS) {
    out = out.replace(re, replacement);
  }
  return out;
}

// Remove leading bullet "* " or "- " from a line and apply all corrections
function stripBullet(line: string): string {
  return applyCorrections(unescapeMarkdown(line.replace(/^\s*[-*]\s+/, '').trim()));
}

// Build a stable anchor string from a progress label
function progressAnchor(progress: string): string {
  return slugify(progress) || 'section';
}

export function parseMarkdown(md: string): SiteSection[] {
  const lines = md.split('\n');
  const sections: SiteSection[] = [];

  let currentSection: SiteSection | null = null;
  let currentLevel: Level | null = null;
  let currentPoint: ProgressPoint | null = null;
  let currentBlock: MessageBlock | null = null;
  let currentMessage: SingleMessage | null = null;
  // Track how many times each anchor slug appears in this level to dedupe
  let anchorCounts: Record<string, number> = {};

  function uniqueAnchor(base: string): string {
    const count = (anchorCounts[base] ?? 0) + 1;
    anchorCounts[base] = count;
    return count === 1 ? base : `${base}-${count}`;
  }

  function flushMessage() {
    if (currentMessage && currentBlock && currentMessage.lines.length > 0) {
      currentBlock.messages.push(currentMessage);
      currentMessage = null;
    }
  }

  function flushBlock() {
    flushMessage();
    if (currentBlock && currentPoint && currentBlock.messages.length > 0) {
      currentPoint.blocks.push(currentBlock);
      currentBlock = null;
    }
  }

  function flushPoint() {
    flushBlock();
    if (currentPoint && currentLevel && currentPoint.blocks.length > 0) {
      currentLevel.points.push(currentPoint);
      currentPoint = null;
    }
  }

  function flushLevel() {
    flushPoint();
    if (currentLevel && currentSection && currentLevel.points.length > 0) {
      // Derive excerpt from first non-system message line
      if (!currentLevel.excerpt) {
        for (const pt of currentLevel.points) {
          for (const blk of pt.blocks) {
            for (const msg of blk.messages) {
              if (msg.sender !== 'system' && msg.lines.length > 0) {
                currentLevel.excerpt = msg.lines[0].slice(0, 200);
                break;
              }
            }
            if (currentLevel.excerpt) break;
          }
          if (currentLevel.excerpt) break;
        }
      }
      currentSection.levels.push(currentLevel);
      currentLevel = null;
    }
    anchorCounts = {};
  }

  function ensureBlock() {
    if (!currentBlock) {
      currentBlock = { messages: [] };
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // H1 = top-level section
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
          excerpt: '',
          points: [],
        };
        anchorCounts = {};
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
          currentPoint = {
            progress: label,
            anchor: uniqueAnchor(progressAnchor(label)),
            blocks: [],
          };
        }
      }
      continue;
    }

    // H4 = Progress milestones like #### **20%** or #### **20% - Stage 1 completion**
    if (/^#### /.test(trimmed)) {
      flushBlock();
      const match = trimmed.match(/^####\s+\*?\*?(.+?)\*?\*?$/);
      if (match) {
        const raw = cleanText(match[1]);
        const parts = raw.split(/\s*[-–]\s*/);
        const progress = parts[0].trim();
        const label = parts.slice(1).join(' - ').trim() || undefined;

        flushPoint();
        currentPoint = {
          progress,
          label,
          anchor: uniqueAnchor(progressAnchor(progress)),
          blocks: [],
        };
        ensureBlock();
      }
      continue;
    }

    if (!currentPoint) {
      currentPoint = {
        progress: 'Overview',
        anchor: uniqueAnchor('overview'),
        blocks: [],
      };
      ensureBlock();
    }

    // Group chat header: **Name:**
    const groupMatch = trimmed.match(/^\*\*([^*]+):\*\*$/);
    if (groupMatch) {
      flushMessage();
      flushBlock();
      currentBlock = { groupName: cleanText(groupMatch[1]), messages: [] };
      continue;
    }

    // Sender line: *Name:*
    const senderMatch = trimmed.match(/^\*([^*]+):\*$/);
    if (senderMatch) {
      flushMessage();
      ensureBlock();
      currentMessage = { sender: cleanText(senderMatch[1]), lines: [] };
      continue;
    }

    // System line: *Name has left the chat*
    const leftChatMatch = trimmed.match(/^\*(.+has left the chat)\*$/);
    if (leftChatMatch) {
      flushMessage();
      ensureBlock();
      currentMessage = { sender: 'system', lines: [cleanText(leftChatMatch[1])] };
      flushMessage();
      continue;
    }

    // Bullet line = message content
    if (/^\s*\*\s+/.test(line) && currentMessage) {
      const content = stripBullet(line);
      if (content) currentMessage.lines.push(content);
      continue;
    }

    // Continuation text
    if (trimmed && currentMessage && !/^[#*]/.test(trimmed)) {
      if (!/^\*\*/.test(trimmed) && !/^\*[^*]/.test(trimmed)) {
        currentMessage.lines.push(applyCorrections(unescapeMarkdown(trimmed)));
      }
    }
  }

  flushLevel();

  return sections.filter(s => s.levels.length > 0);
}
