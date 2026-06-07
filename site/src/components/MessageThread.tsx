import type { Level, SingleMessage } from '../utils/types';

// ─── Sender colour palette (deterministic, stable across pages) ───────────────
const PALETTE = [
  '#4fc3f7', '#81c784', '#ff8a65', '#ce93d8', '#fff176',
  '#80deea', '#a5d6a7', '#ffab91', '#b39ddb', '#90caf9',
  '#f48fb1', '#80cbc4', '#ffcc02', '#e6ee9c', '#ffb74d',
];
const colorCache: Record<string, string> = {};
let colorIdx = 0;

function senderColor(sender: string): string {
  if (sender === 'system') return '#555';
  if (!colorCache[sender]) {
    colorCache[sender] = PALETTE[colorIdx % PALETTE.length];
    colorIdx++;
  }
  return colorCache[sender];
}

// ─── Bubble ───────────────────────────────────────────────────────────────────
function Bubble({ line, color }: { line: string; color: string }) {
  return (
    <div
      style={{
        display: 'inline-block',
        maxWidth: '78%',
        background: '#1c1c1e',
        borderRadius: '18px',
        borderTopLeftRadius: '4px',
        padding: '9px 14px',
        border: `1px solid ${color}40`,
      }}
    >
      <span style={{ fontSize: 14, color: '#f0f0f0', lineHeight: 1.55 }}>{line}</span>
    </div>
  );
}

// ─── Single message (sender + bubbles) ───────────────────────────────────────
function MessageRow({ msg }: { msg: SingleMessage }) {
  if (msg.sender === 'system') {
    return (
      <div style={{ textAlign: 'center', padding: '4px 0', color: '#555', fontSize: 12, fontStyle: 'italic' }}>
        {msg.lines.join(' ')}
      </div>
    );
  }
  const color = senderColor(msg.sender);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 3, marginLeft: 2 }}>
        {msg.sender}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {msg.lines.map((line, i) => (
          <Bubble key={i} line={line} color={color} />
        ))}
      </div>
    </div>
  );
}

// ─── Message Thread ───────────────────────────────────────────────────────────
interface Props {
  level: Level;
  prevLevel?: { id: string; name: string };
  nextLevel?: { id: string; name: string };
}

export function MessageThread({ level, prevLevel, nextLevel }: Props) {
  return (
    <div style={{ maxWidth: 740, margin: '0 auto', padding: '24px 16px 48px' }}>

      {/* Page header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
          {level.sectionName}
        </div>
        <h1 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: '#fff' }}>
          {level.name}
        </h1>
      </div>

      {/* Table of contents */}
      {level.points.length > 2 && (
        <details style={{ marginBottom: 24, background: '#0f0f0f', border: '1px solid #222', borderRadius: 10, padding: '10px 14px' }}>
          <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', userSelect: 'none' }}>
            Jump to section ↓
          </summary>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px', marginTop: 10 }}>
            {level.points.map(pt => (
              <a
                key={pt.anchor}
                href={`#${pt.anchor}`}
                style={{
                  fontSize: 12,
                  color: /^\d+%/.test(pt.progress) ? '#90caf9' : '#ce93d8',
                  textDecoration: 'none',
                  background: '#1c1c1e',
                  borderRadius: 6,
                  padding: '3px 8px',
                }}
              >
                {pt.progress}{pt.label ? ` — ${pt.label}` : ''}
              </a>
            ))}
          </div>
        </details>
      )}

      {/* Messages */}
      {level.points.map((point) => (
        <div key={point.anchor}>
          {/* Section divider */}
          <div
            id={point.anchor}
            style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 14px', scrollMarginTop: 12 }}
          >
            <div style={{ flex: 1, height: 1, background: '#1c1c1e' }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: /^\d+%/.test(point.progress) ? '#546e7a' : '#4a4a72',
                background: '#111',
                border: `1px solid ${/^\d+%/.test(point.progress) ? '#1e3040' : '#2a2a4a'}`,
                borderRadius: 6,
                padding: '3px 10px',
                whiteSpace: 'nowrap',
              }}
            >
              {/^\d+%/.test(point.progress) ? '📍' : '📋'} {point.progress}
              {point.label ? ` — ${point.label}` : ''}
            </span>
            <div style={{ flex: 1, height: 1, background: '#1c1c1e' }} />
          </div>

          {/* Blocks */}
          {point.blocks.map((block, bi) => (
            <div key={bi} style={{ marginBottom: 14 }}>
              {block.groupName && (
                <div
                  style={{
                    background: '#0f1729',
                    border: '1px solid #1e3058',
                    borderRadius: 8,
                    padding: '7px 12px',
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#5c9aff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    💬 {block.groupName}
                  </span>
                </div>
              )}
              <div style={{ paddingLeft: block.groupName ? 12 : 0 }}>
                {block.messages.map((msg, mi) => (
                  <MessageRow key={mi} msg={msg} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Prev / Next navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 40,
          paddingTop: 24,
          borderTop: '1px solid #1c1c1e',
        }}
      >
        {prevLevel ? (
          <a
            href={`/level/${prevLevel.id}`}
            style={{
              flex: 1,
              textDecoration: 'none',
              background: '#0f0f0f',
              border: '1px solid #1c1c1e',
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>← Previous</span>
            <span style={{ fontSize: 13, color: '#ccc', fontWeight: 600 }}>{prevLevel.name}</span>
          </a>
        ) : <div style={{ flex: 1 }} />}

        {nextLevel ? (
          <a
            href={`/level/${nextLevel.id}`}
            style={{
              flex: 1,
              textDecoration: 'none',
              background: '#0f0f0f',
              border: '1px solid #1c1c1e',
              borderRadius: 10,
              padding: '12px 16px',
              textAlign: 'right',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'flex-end',
            }}
          >
            <span style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Next →</span>
            <span style={{ fontSize: 13, color: '#ccc', fontWeight: 600 }}>{nextLevel.name}</span>
          </a>
        ) : <div style={{ flex: 1 }} />}
      </div>
    </div>
  );
}
