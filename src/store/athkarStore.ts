
import { create } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import type { AthkarGroup, Athkar, AthkarLogStore, AppState } from '@/types';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { firebaseApp } from '@/firebase/config';

const THEME_STORAGE_KEY = 'athkari-theme';
let firestoreDb: any = null;
try {
  firestoreDb = getFirestore(firebaseApp);
} catch (e) {
  console.error("Could not initialize Firestore", e)
}


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
  uid: string | null;
};

type AthkarActions = {
  setInitialLoad: (uid: string) => Promise<void>;
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


// Debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => void;
};

const debouncedSaveToFirestore = debounce(async (uid: string, data: AppState) => {
  if (!uid || !firestoreDb) return;
  try {
    const docRef = doc(firestoreDb, 'users', uid);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error("Error saving to Firestore:", error);
  }
}, 1000); // 1-second debounce


const useAthkarStore = create<AthkarState & AthkarActions>()(
    (set, get) => ({
      groups: [],
      athkarLog: {},
      theme: 'light', 
      isHydrated: false,
      uid: null,
      setInitialLoad: async (uid) => {
        if (get().isHydrated && get().uid === uid) return; 

        if (!firestoreDb) {
            set({ isHydrated: true, theme: loadInitialTheme(), uid });
            return;
        }

        try {
            const docRef = doc(firestoreDb, 'users', uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const firestoreState = docSnap.data() as AppState;
                set({ 
                    groups: firestoreState.groups || [], 
                    athkarLog: firestoreState.athkarLog || {},
                    isHydrated: true,
                    theme: loadInitialTheme(),
                    uid: uid,
                });
            } else {
                 set({ isHydrated: true, theme: loadInitialTheme(), uid: uid, groups: [], athkarLog: {} });
            }
        } catch (error) {
            console.error("Error loading data from Firestore:", error);
            set({ isHydrated: true, theme: loadInitialTheme(), uid: uid });
        }
      },
      addGroup: (name) => {
        const newGroup: AthkarGroup = {
          id: Date.now().toString(),
          name: name,
          athkar: [],
        };
        set((state) => {
            const newGroups = [...state.groups, newGroup];
            if (state.uid) debouncedSaveToFirestore(state.uid, { groups: newGroups, athkarLog: state.athkarLog });
            return { groups: newGroups };
        });
      },
      editGroup: (id, newName) =>
        set((state) => {
          const newGroups = state.groups.map((g) => (g.id === id ? { ...g, name: newName } : g));
          if (state.uid) debouncedSaveToFirestore(state.uid, { groups: newGroups, athkarLog: state.athkarLog });
          return { groups: newGroups };
        }),
      deleteGroup: (id) =>
        set((state) => {
            const newGroups = state.groups.filter((g) => g.id !== id);
            if (state.uid) debouncedSaveToFirestore(state.uid, { groups: newGroups, athkarLog: state.athkarLog });
            return { groups: newGroups };
        }),
      reorderGroups: (startIndex, endIndex) =>
        set((state) => {
           const reorderedGroups = Array.from(state.groups);
           const [moved] = reorderedGroups.splice(startIndex, 1);
           reorderedGroups.splice(endIndex, 0, moved);
           if (state.uid) debouncedSaveToFirestore(state.uid, { groups: reorderedGroups, athkarLog: state.athkarLog });
           return { groups: reorderedGroups };
        }),
      getGroupById: (id) => get().groups.find((g) => g.id === id),
      addAthkarToGroup: (groupId, athkarData) => {
        const newAthkarItem: Athkar = {
          id: Date.now().toString() + Math.random().toString(),
          ...athkarData,
        };
        set((state) => {
          const newGroups = state.groups.map((g) =>
            g.id === groupId ? { ...g, athkar: [...g.athkar, newAthkarItem] } : g
          );
          if (state.uid) debouncedSaveToFirestore(state.uid, { groups: newGroups, athkarLog: state.athkarLog });
          return { groups: newGroups };
        });
        return newAthkarItem;
      },
      editAthkarInGroup: (groupId, athkarId, athkarData) =>
        set((state) => {
          const newGroups = state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  athkar: g.athkar.map((a) =>
                    a.id === athkarId ? { ...a, ...athkarData } : a
                  ),
                }
              : g
          );
          if (state.uid) debouncedSaveToFirestore(state.uid, { groups: newGroups, athkarLog: state.athkarLog });
          return { groups: newGroups };
        }),
      deleteAthkarFromGroup: (groupId, athkarId) =>
        set((state) => {
          const newGroups = state.groups.map((g) =>
            g.id === groupId
              ? { ...g, athkar: g.athkar.filter((a) => a.id !== athkarId) }
              : g
          );
          if (state.uid) debouncedSaveToFirestore(state.uid, { groups: newGroups, athkarLog: state.athkarLog });
          return { groups: newGroups };
        }),
      reorderAthkarInGroup: (groupId, startIndex, endIndex) =>
        set((state) => {
          const newGroups = state.groups.map((g) => {
            if (g.id === groupId) {
              const reorderedAthkar = Array.from(g.athkar);
              const [moved] = reorderedAthkar.splice(startIndex, 1);
              reorderedAthkar.splice(endIndex, 0, moved);
              return { ...g, athkar: reorderedAthkar };
            }
            return g;
          });
          if (state.uid) debouncedSaveToFirestore(state.uid, { groups: newGroups, athkarLog: state.athkarLog });
          return { groups: newGroups };
        }),
      updateAthkarLog: (athkarArabic, amount) =>
        set((state) => {
          const newLog = { ...state.athkarLog };
          const currentCount = newLog[athkarArabic] || 0;
          newLog[athkarArabic] = Math.max(0, currentCount + amount);
          if (newLog[athkarArabic] === 0) {
            delete newLog[athkarArabic];
          }
          if (state.uid) debouncedSaveToFirestore(state.uid, { groups: state.groups, athkarLog: newLog });
          return { athkarLog: newLog };
        }),
      clearAthkarLog: () => set((state) => {
          if (state.uid) debouncedSaveToFirestore(state.uid, { groups: state.groups, athkarLog: {} });
          return { athkarLog: {} }
      }),
      deleteAthkarLogEntry: (athkarArabic) =>
        set((state) => {
          const newLog = { ...state.athkarLog };
          delete newLog[athkarArabic];
          if (state.uid) debouncedSaveToFirestore(state.uid, { groups: state.groups, athkarLog: newLog });
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
    })
);

export { useAthkarStore };
