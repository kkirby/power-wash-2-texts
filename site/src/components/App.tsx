import { useState, useCallback, useEffect } from 'react';
import {
  Text,
  Box,
  Stack,
  Badge,
  TextInput,
  Divider,
} from '@mantine/core';
import { AuthorLink } from './AuthorLinks';
import { MessageThread } from './MessageThread';
import type { Level, SiteSection } from '../utils/types';

interface Props {
  sections: SiteSection[];
}

const SECTION_COLORS: Record<string, string> = {
  Career: '#2979ff',
  'Caldera Chronicles': '#aa00ff',
  'Adventure Time DLC': '#ff6f00',
};

function Sidebar({
  sections,
  selectedId,
  onSelect,
  search,
  onSearch,
}: {
  sections: SiteSection[];
  selectedId: string;
  onSelect: (id: string) => void;
  search: string;
  onSearch: (v: string) => void;
}) {
  const filtered = sections
    .map(s => ({
      ...s,
      levels: s.levels.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter(s => s.levels.length > 0);

  return (
    <div
      style={{
        width: 260,
        minWidth: 260,
        background: '#0f0f0f',
        borderRight: '1px solid #222',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 14px 12px',
          borderBottom: '1px solid #1c1c1e',
          background: '#0a0a0a',
        }}
      >
        <Text fw={800} size="md" c="white" mb={2}>
          💦 PW2 Messages
        </Text>
        <Text size="xs" c="dimmed" mb={8}>
          Compiled by <AuthorLink size="xs" c="blue.4" fw={600} />
        </Text>
        <TextInput
          placeholder="Search levels…"
          value={search}
          onChange={e => onSearch(e.currentTarget.value)}
          size="xs"
          styles={{
            input: {
              background: '#1c1c1e',
              border: '1px solid #333',
              color: 'white',
              '&::placeholder': { color: '#555' },
            },
          }}
        />
      </div>

      {/* Level list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 6px',
        }}
      >
        {filtered.map(section => (
          <div key={section.name} style={{ marginBottom: 8 }}>
            <div style={{ padding: '4px 8px 6px' }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: SECTION_COLORS[section.name] ?? '#888',
                }}
              >
                {section.name}
              </span>
            </div>
            {section.levels.map(level => {
              const active = level.id === selectedId;
              return (
                <button
                  key={level.id}
                  onClick={() => onSelect(level.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: active ? '#1a3a6b' : 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    padding: '7px 12px',
                    color: active ? '#fff' : '#aaa',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    transition: 'background 0.15s, color 0.15s',
                    marginBottom: 1,
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.target as HTMLButtonElement).style.background = '#1c1c1e';
                      (e.target as HTMLButtonElement).style.color = '#fff';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.target as HTMLButtonElement).style.background = 'transparent';
                      (e.target as HTMLButtonElement).style.color = '#aaa';
                    }
                  }}
                >
                  {level.name}
                </button>
              );
            })}
            <div style={{ borderTop: '1px solid #1c1c1e', margin: '6px 4px 2px' }} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid #1c1c1e',
          background: '#0a0a0a',
          textAlign: 'center',
        }}
      >
        <Text size="xs" c="dimmed">
          Messages by <AuthorLink size="xs" c="blue.3" fw={700} />
        </Text>
      </div>
    </div>
  );
}

export function App({ sections }: Props) {
  const allLevels = sections.flatMap(s => s.levels);
  const [selectedId, setSelectedId] = useState<string>(allLevels[0]?.id ?? '');
  const [search, setSearch] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const selectedLevel: Level | undefined = allLevels.find(l => l.id === selectedId);

  const selectLevel = useCallback((id: string) => {
    setSelectedId(id);
    setMobileNavOpen(false);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
        position: 'relative',
      }}
    >
      {/* Desktop sidebar — always visible */}
      {!isMobile && (
        <Sidebar
          sections={sections}
          selectedId={selectedId}
          onSelect={selectLevel}
          search={search}
          onSearch={setSearch}
        />
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && mobileNavOpen && (
        <>
          <div
            onClick={() => setMobileNavOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 100,
            }}
          />
          <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 101 }}>
            <Sidebar
              sections={sections}
              selectedId={selectedId}
              onSelect={selectLevel}
              search={search}
              onSearch={setSearch}
            />
          </div>
        </>
      )}

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Mobile top bar */}
        {isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderBottom: '1px solid #222',
              background: '#0a0a0a',
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setMobileNavOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: 4,
                fontSize: 20,
                lineHeight: 1,
              }}
              aria-label="Open navigation"
            >
              ☰
            </button>
            <Text fw={600} c="white" size="sm" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedLevel?.name ?? 'Select a level'}
            </Text>
          </div>
        )}

        {/* Message content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {selectedLevel ? (
            <MessageThread level={selectedLevel} />
          ) : (
            <Box ta="center" pt="xl">
              <Text c="dimmed">Select a level from the sidebar</Text>
            </Box>
          )}
        </div>
      </div>
    </div>
  );
}
