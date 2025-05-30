export interface Athkar {
  id: string;
  text: string; // English translation or description
  arabic: string; // The Athkar text in Arabic
  category: string; // e.g., Morning, Evening, After Prayer
  count?: number; // How many times to recite, if applicable
  completed: boolean;
  completedCount?: number; // How many times user has completed (if count > 1)
}

// New type for Athkar Group
export interface AthkarGroup {
  id: string;
  name: string;
}
