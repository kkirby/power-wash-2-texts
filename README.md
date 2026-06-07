# 💦 PowerWash Simulator 2 — Text Messages

A static website for browsing all in-game text messages and group chats from **PowerWash Simulator 2**, organized by level with an SMS-style UI.

**[https://kkirby.github.io/power-wash-2-texts/](https://kkirby.github.io/power-wash-2-texts/)**

---

## Credits

All text messages were compiled by **[Altradil](https://www.speedrun.com/users/Altradil)** in this [Google Doc](https://docs.google.com/document/d/18aRGzwHIuNQkgt_BbEFhapXlv_PjnYd0krnw__XHb3A/). This site is a fan-made reader built on top of that work.

Not affiliated with FuturLab.

---

## Features

- **44 levels** across Career, Caldera Chronicles, and Adventure Time DLC
- **SMS-style bubbles** — each character gets a consistent colour throughout the site
- **Group chats** rendered with their own header (Muckingham Chat, FunFair Funsquad, etc.)
- **Per-level routes** — every level has a unique, shareable URL (`/level/shooting-gallery`)
- **Jump to section** — collapsible table of contents linking to each progress marker
- **Prev / Next navigation** between levels
- **Live search** in the sidebar
- **Static build** — zero server required, deployable anywhere

---

## Tech Stack

| Layer         | Tool                                                          |
| ------------- | ------------------------------------------------------------- |
| Framework     | [Astro](https://astro.build) v6 (static output)               |
| UI components | [Mantine](https://mantine.dev) v9                             |
| Interactivity | [React](https://react.dev) v19 (sidebar island)               |
| Sitemap       | `@astrojs/sitemap`                                            |
| Content       | Parsed from `PowerWash Simulator 2 Messages.md` at build time |

The markdown is parsed by a custom TypeScript parser (`src/utils/parseMarkdown.ts`) that extracts levels, progress milestones, senders, and group chats into a typed data tree. No markdown is shipped to the browser — everything is rendered to static HTML at build time.

---

## Project Structure

```text
.
├── PowerWash Simulator 2 Messages.md   # Source data (from Altradil's Google Doc)
└── site/
    ├── src/
    │   ├── components/
    │   │   ├── AuthorLinks.tsx          # <AuthorLink /> and <SourceDocLink /> components
    │   │   ├── MessageThread.tsx        # Level page: bubbles, TOC, prev/next nav
    │   │   └── SidebarIsland.tsx        # React island: search + level list
    │   ├── data/
    │   │   └── messages.ts              # Reads + parses the .md at build time
    │   ├── layouts/
    │   │   └── SiteLayout.astro         # Shared HTML shell with SEO tags
    │   ├── pages/
    │   │   ├── index.astro              # Landing page (level grid)
    │   │   └── level/
    │   │       └── [id].astro           # Dynamic route — one page per level
    │   └── utils/
    │       ├── author.ts                # Single source of truth for Altradil's links
    │       ├── parseMarkdown.ts         # Custom markdown → data parser
    │       └── types.ts                 # TypeScript interfaces
    └── astro.config.mjs
```

---

## Development

```bash
cd site
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs to site/dist/
npm run preview    # preview the production build
```

> **Node ≥ 22** required.

The site reads `../PowerWash Simulator 2 Messages.md` (relative to `site/`) at build time, so the `.md` file must stay in the repo root.
