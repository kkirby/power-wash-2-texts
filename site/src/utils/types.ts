export interface SingleMessage {
  sender: string;
  lines: string[];
}

export interface MessageBlock {
  groupName?: string;
  messages: SingleMessage[];
}

export interface ProgressPoint {
  /** Display label: "Introduction", "20%", "Completion", etc. */
  progress: string;
  /** Extra label after a dash: "Stage 1 complete" */
  label?: string;
  /** Stable anchor id for jump-to-section links */
  anchor: string;
  blocks: MessageBlock[];
}

export interface Level {
  id: string;
  name: string;
  sectionName: string;
  /** First message text for SEO description */
  excerpt: string;
  points: ProgressPoint[];
}

export interface SiteSection {
  name: string;
  levels: Level[];
}
