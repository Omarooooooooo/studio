
import { create } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import type { AthkarGroup, Athkar, AthkarLogStore, AppState } from '@/types';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';

const THEME_STORAGE_KEY = 'athkari-theme';

export const loadInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') {
    return 'light'; 
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
  isHydrated: boolean; 
};

type AthkarActions = {
  setInitialLoad: (uid?: string) => void;
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

const persistOptions: PersistOptions<AthkarState & AthkarActions, { user: AppState | null }> = {
  name: 'athkari-storage',
  storage: {
    getItem: async (name) => {
      const str = localStorage.getItem(name);
      if (!str) return null;
      const { state, version } = JSON.parse(str);
      const userState = state as AthkarState & AthkarActions;
      
      const uid = userState.getGroupById('user-id')?.name; // A bit hacky way to get uid
      if (!uid) {
        return JSON.stringify({ state, version });
      }

      const db = getFirestore();
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const firestoreState = docSnap.data() as AppState;
        return JSON.stringify({
          state: {
            ...userState,
            groups: firestoreState.groups,
            athkarLog: firestoreState.athkarLog,
          },
          version,
        });
      } else {
         return JSON.stringify({ state, version });
      }
    },
    setItem: async (name, value) => {
      const { state } = JSON.parse(value) as { state: AthkarState };
      const uid = get().getGroupById('user-id')?.name; // Hacky way to get uid

      if (uid) {
        const db = getFirestore();
        const docRef = doc(db, 'users', uid);
        const dataToSave: AppState = {
          groups: state.groups,
          athkarLog: state.athkarLog,
        };
        await setDoc(docRef, dataToSave, { merge: true });
      }
      
      localStorage.setItem(name, value);
    },
    removeItem: (name) => localStorage.removeItem(name),
  },
  partialize: (state) => ({ 
    groups: state.groups, 
    athkarLog: state.athkarLog 
  }),
};


export const useAthkarStore = create<AthkarState & AthkarActions>()(
  persist(
    (set, get) => ({
      groups: [],
      athkarLog: {},
      theme: 'light', 
      isHydrated: false,
      setInitialLoad: (uid) => {
        if (get().isHydrated) return; // Prevent re-hydration
        
        // This is a temporary hack to store uid in the store without changing the main state structure much
        if (uid) {
            const existingUser = get().groups.find(g => g.id === 'user-id');
            if (!existingUser) {
                get().addGroup('user-id'); // This is a dummy group to hold the userId
                get().editGroup('user-id', uid);
            }
        }
        
        set({ isHydrated: true, theme: loadInitialTheme() });
      },
      addGroup: (name) => {
        const newGroup: AthkarGroup = {
          id: Date.now().toString(),
          name: name,
          athkar: [],
        };
        set((state) => ({ groups: [...state.groups.filter(g => g.id !== 'user-id'), newGroup] }));
      },
      editGroup: (id, newName) =>
        set((state) => ({
          groups: state.groups.map((g) => (g.id === id ? { ...g, name: newName } : g)),
        })),
      deleteGroup: (id) =>
        set((state) => ({ groups: state.groups.filter((g) => g.id !== id) })),
      reorderGroups: (startIndex, endIndex) =>
        set((state) => {
           const userGroup = state.groups.find(g => g.id === 'user-id');
           const normalGroups = state.groups.filter(g => g.id !== 'user-id');
           const [removed] = normalGroups.splice(startIndex, 1);
           normalGroups.splice(endIndex, 0, removed);
           const finalGroups = userGroup ? [userGroup, ...normalGroups] : normalGroups;
           return { groups: finalGroups };
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
    persistOptions
  )
);

    