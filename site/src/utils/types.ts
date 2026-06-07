export interface SingleMessage {
  sender: string;
  lines: string[];
}

export interface MessageBlock {
  groupName?: string;
  messages: SingleMessage[];
}

export interface ProgressPoint {
  progress: string; // "Introduction", "Level Overview", "20%", "Completion", etc.
  label?: string; // "Stage 1 complete"
  blocks: MessageBlock[];
}

export interface Level {
  id: string;
  name: string;
  sectionName: string;
  points: ProgressPoint[];
}

export interface SiteSection {
  name: string;
  levels: Level[];
}
