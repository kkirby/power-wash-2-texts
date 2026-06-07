import '@mantine/core/styles.css';
import { useState, useEffect } from 'react';
import { MantineProvider, createTheme, TextInput, Text } from '@mantine/core';
import { AuthorLink, SourceDocLink } from './AuthorLinks';
import { siteUrl } from '../utils/url';
import type { SiteSection } from '../utils/types';

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

const SECTION_COLORS: Record<string, string> = {
  Career: '#2979ff',
  'Caldera Chronicles': '#aa00ff',
  'Adventure Time DLC': '#ff6f00',
};

interface Props {
  sections: SiteSection[];
  currentLevelId: string;
}

/** Extract the level id from the current pathname */
function levelIdFromPath(): string {
  const match = window.location.pathname.match(/\/level\/([^/]+)/);
  return match?.[1] ?? '';
}

function SidebarContent({ sections, currentLevelId }: Props) {
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLevelId, setActiveLevelId] = useState(currentLevelId);

  useEffect(() => {
    function onPageLoad() {
      setActiveLevelId(levelIdFromPath());
      setMobileOpen(false);
    }
    document.addEventListener('astro:page-load', onPageLoad);
    return () => document.removeEventListener('astro:page-load', onPageLoad);
  }, []);

  const filtered = sections
    .map(s => ({
      ...s,
      levels: s.levels.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter(s => s.levels.length > 0);

  return (
    <>
      {/*
        The sidebar is always rendered once in the DOM.
        On desktop it sits in the normal flow.
        On mobile it's fixed and slides in/out with a CSS transform —
        this keeps the ID unique and preserves scroll position correctly.
      */}
      <div
        id="sidebar-wrapper"
        className={mobileOpen ? 'sidebar-open' : ''}
        style={{
          width: 260,
          background: '#0f0f0f',
          borderRight: '1px solid #1c1c1e',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #1c1c1e', background: '#0a0a0a', flexShrink: 0 }}>
          <a href={siteUrl('/')} style={{ textDecoration: 'none' }}>
            <Text fw={800} size="md" c="white" style={{ lineHeight: 1.2 }}>
              💦 PW2 Messages
            </Text>
          </a>
          <Text size="xs" c="dimmed" mt={2} mb={2}>
            Compiled by <AuthorLink size="xs" c="blue.4" fw={600} />
          </Text>
          <Text size="xs" c="dimmed" mb={8}>
            Source: <SourceDocLink size="xs" c="blue.4" />
          </Text>
          <TextInput
            placeholder="Search levels…"
            value={search}
            onChange={e => setSearch(e.currentTarget.value)}
            size="xs"
            styles={{
              input: {
                background: '#1c1c1e',
                border: '1px solid #333',
                color: 'white',
              },
            }}
          />
        </div>

        {/* Level list — the only instance of this ID in the DOM */}
        <div id="sidebar-level-list" style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
          {filtered.map(section => (
            <div key={section.name} style={{ marginBottom: 6 }}>
              <div style={{ padding: '4px 8px 4px' }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  color: SECTION_COLORS[section.name] ?? '#888',
                }}>
                  {section.name}
                </span>
              </div>
              {section.levels.map(level => {
                const active = level.id === activeLevelId;
                return (
                  <a
                    key={level.id}
                    href={siteUrl(`/level/${level.id}`)}
                    style={{
                      display: 'block',
                      textDecoration: 'none',
                      background: active ? '#1a3a6b' : 'transparent',
                      borderRadius: 8,
                      padding: '7px 12px',
                      color: active ? '#fff' : '#aaa',
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      marginBottom: 1,
                      transition: 'background 0.12s, color 0.12s',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.background = '#1c1c1e';
                        (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                        (e.currentTarget as HTMLAnchorElement).style.color = '#aaa';
                      }
                    }}
                  >
                    {level.name}
                  </a>
                );
              })}
              <div style={{ borderTop: '1px solid #1c1c1e', margin: '4px 4px 2px' }} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid #1c1c1e', background: '#0a0a0a', textAlign: 'center', flexShrink: 0 }}>
          <Text size="xs" c="dimmed">
            Messages by <AuthorLink size="xs" c="blue.3" fw={700} />
            {' '}·{' '}
            <SourceDocLink size="xs" c="dimmed">Source doc</SourceDocLink>
          </Text>
        </div>
      </div>

      {/* Mobile backdrop — clicking it closes the drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'none', // shown via CSS on mobile only
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 199,
          }}
          className="sidebar-backdrop"
        />
      )}

      {/* Mobile top bar */}
      <div
        className="mobile-topbar"
        style={{ display: 'none' }}
      >
        <button
          onClick={() => setMobileOpen(o => !o)}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px 14px', fontSize: 20, lineHeight: 1, flexShrink: 0 }}
          aria-label="Open navigation"
        >
          ☰
        </button>
        <Text fw={600} c="white" size="sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: 14 }}>
          {sections.flatMap(s => s.levels).find(l => l.id === activeLevelId)?.name ?? 'PowerWash 2 Messages'}
        </Text>
      </div>

      <style>{`
        /* ── Desktop ── */
        @media (min-width: 701px) {
          #sidebar-wrapper {
            position: static;
            transform: none !important;
          }
          .mobile-topbar { display: none !important; }
          .sidebar-backdrop { display: none !important; }
        }

        /* ── Mobile ── */
        @media (max-width: 700px) {
          #sidebar-wrapper {
            position: fixed;
            top: 0; left: 0; bottom: 0;
            z-index: 200;
            transform: translateX(-100%);
            transition: transform 0.22s ease;
            height: 100dvh;
          }
          #sidebar-wrapper.sidebar-open {
            transform: translateX(0);
          }
          .sidebar-backdrop {
            display: block !important;
          }
          .mobile-topbar {
            display: flex !important;
            align-items: center;
            gap: 8px;
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 52px;
            background: #0a0a0a;
            border-bottom: 1px solid #1c1c1e;
            z-index: 100;
          }
          #main-content { padding-top: 52px; }
        }
      `}</style>
    </>
  );
}

export function SidebarIsland(props: Props) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <SidebarContent {...props} />
    </MantineProvider>
  );
}
