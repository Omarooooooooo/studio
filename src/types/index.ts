
export interface Athkar {
  id: string;
  arabic: string; // The Athkar text in Arabic
  virtue?: string; // Virtue of the Athkar (فضله)
  text?: string; // Optional: English translation or further description/title
  category?: string; // Optional: e.g., Morning, Evening, After Prayer
  count?: number; // How many times to recite, if applicable
  readingTimeSeconds?: number; // Reading time in seconds
  completed: boolean; // Completion status
  completedCount?: number; // How many times user has completed (if count > 1 or non-countable marked as complete)
}

// Updated type for Athkar Group
export interface AthkarGroup {
  id: string;
  name: string;
  athkar: Athkar[]; // Array of Athkar specific to this group, ensured to be initialized
}

// Type for Athkar Log entry
export interface AthkarLogEntry {
  arabic: string;
  totalCompleted: number;
}
