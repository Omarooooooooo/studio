
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AthkarGroup, Athkar, AthkarLogStore } from '@/types';

const THEME_STORAGE_KEY = 'athkari-theme';

// This function can be called on the client side to get the initial theme
export const loadInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') {
    return 'light'; // Default for SSR
  }
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
  if (storedTheme) {
    return storedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};


type AthkarState = {
  groups: AthkarGroup[];
  athkarLog: AthkarLogStore;
  theme: 'light' | 'dark';
  isHydrated: boolean; // We still need this to prevent SSR/hydration mismatch
};

type AthkarActions = {
  setInitialLoad: () => void;
  addGroup: (name: string) => void;
  editGroup: (id: string, newName: string) => void;
  deleteGroup: (id: string) => void;
  reorderGroups: (startIndex: number, endIndex: number) => void;
  getGroupById: (id: string) => AthkarGroup | undefined;
  addAthkarToGroup: (groupId: string, athkarData: Omit<Athkar, 'id'>) => Athkar | null;
  editAthkarInGroup: (groupId: string, athkarId: string, athkarData: Partial<Athkar>) => void;
  deleteAthkarFromGroup: (groupId: string, athkarId: string) => void;
  reorderAthkarInGroup: (groupId: string, startIndex: number, endIndex: number) => void;
  updateAthkarLog: (athkarArabic: string, amount: number) => void;
  clearAthkarLog: () => void;
  deleteAthkarLogEntry: (athkarArabic: string) => void;
  toggleTheme: () => void;
};


export const useAthkarStore = create<AthkarState & AthkarActions>()(
  persist(
    (set, get) => ({
      groups: [],
      athkarLog: {},
      theme: 'light', 
      isHydrated: false, // Start as not hydrated
      setInitialLoad: () => {
        set({ isHydrated: true, theme: loadInitialTheme() });
      },
      addGroup: (name) => {
        const newGroup: AthkarGroup = {
          id: Date.now().toString(),
          name: name,
          athkar: [],
        };
        set((state) => ({ groups: [...state.groups, newGroup] }));
      },
      editGroup: (id, newName) =>
        set((state) => ({
          groups: state.groups.map((g) => (g.id === id ? { ...g, name: newName } : g)),
        })),
      deleteGroup: (id) =>
        set((state) => ({ groups: state.groups.filter((g) => g.id !== id) })),
      reorderGroups: (startIndex, endIndex) =>
        set((state) => {
          const result = Array.from(state.groups);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return { groups: result };
        }),
      getGroupById: (id) => get().groups.find((g) => g.id === id),
      addAthkarToGroup: (groupId, athkarData) => {
        const newAthkarItem: Athkar = {
          id: Date.now().toString() + Math.random().toString(),
          ...athkarData,
        };
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId ? { ...g, athkar: [...g.athkar, newAthkarItem] } : g
          ),
        }));
        return newAthkarItem;
      },
      editAthkarInGroup: (groupId, athkarId, athkarData) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  athkar: g.athkar.map((a) =>
                    a.id === athkarId ? { ...a, ...athkarData } : a
                  ),
                }
              : g
          ),
        })),
      deleteAthkarFromGroup: (groupId, athkarId) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, athkar: g.athkar.filter((a) => a.id !== athkarId) }
              : g
          ),
        })),
      reorderAthkarInGroup: (groupId, startIndex, endIndex) =>
        set((state) => ({
          groups: state.groups.map((g) => {
            if (g.id === groupId) {
              const reorderedAthkar = Array.from(g.athkar);
              const [moved] = reorderedAthkar.splice(startIndex, 1);
              reorderedAthkar.splice(endIndex, 0, moved);
              return { ...g, athkar: reorderedAthkar };
            }
            return g;
          }),
        })),
      updateAthkarLog: (athkarArabic, amount) =>
        set((state) => {
          const newLog = { ...state.athkarLog };
          const currentCount = newLog[athkarArabic] || 0;
          newLog[athkarArabic] = Math.max(0, currentCount + amount);
          if (newLog[athkarArabic] === 0) {
            delete newLog[athkarArabic];
          }
          return { athkarLog: newLog };
        }),
      clearAthkarLog: () => set({ athkarLog: {} }),
      deleteAthkarLogEntry: (athkarArabic) =>
        set((state) => {
          const newLog = { ...state.athkarLog };
          delete newLog[athkarArabic];
          return { athkarLog: newLog };
        }),
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
            localStorage.setItem(THEME_STORAGE_KEY, newTheme);
          }
          return { theme: newTheme };
        }),
    }),
    {
      name: 'athkari-storage', 
      storage: createJSONStorage(() => localStorage), 
      // We only persist the data, not the UI state like `isHydrated` or `theme`
      partialize: (state) => ({ groups: state.groups, athkarLog: state.athkarLog }),
      // onRehydrateStorage is removed to simplify and control hydration manually.
    }
  )
);
