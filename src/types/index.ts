
// This is what's stored in localStorage for groups
export interface Athkar {
  id: string;
  arabic: string; // The Athkar text in Arabic
  virtue?: string; // Virtue of the Athkar (فضله)
  count?: number; // Target repetitions for one "cycle" of completion
  readingTimeSeconds?: number; // Reading time in seconds
  // completedCount is removed, historical data will be in a separate log
}

// Updated type for Athkar Group
export interface AthkarGroup {
  id:string;
  name: string;
  athkar: Athkar[]; // Array of Athkar objects as defined above
}

// New type for the separate Athkar Log data stored in localStorage
export interface AthkarLogStore {
  [athkarArabic: string]: number; // key is Athkar Arabic text, value is total completed repetitions
}
