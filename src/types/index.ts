
// This is what's stored in localStorage
export interface Athkar {
  id: string;
  arabic: string; // The Athkar text in Arabic
  virtue?: string; // Virtue of the Athkar (فضله)
  count?: number; // Target repetitions for one "cycle" of completion
  readingTimeSeconds?: number; // Reading time in seconds
  completedCount: number; // CUMULATIVE total completions (incremented by `count` or 1 each cycle)
}

// Updated type for Athkar Group
export interface AthkarGroup {
  id: string;
  name: string;
  athkar: Athkar[]; // Array of Athkar objects as defined above
}

// Type for Athkar Log entry - REMOVED
// export interface AthkarLogEntry {
//   arabic: string;
//   totalCompleted: number;
// }

    