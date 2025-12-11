
import { create } from 'zustand';
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

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<F>) => {
    clearTimeout(timeout!);
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

const saveStateToFirestore = debounce(async (uid: string, state: AppState) => {
  if (!uid || !firestoreDb) return;
  try {
    const docRef = doc(firestoreDb, 'users', uid);
    await setDoc(docRef, state, { merge: true });
  } catch (error) {
    console.error("Error saving state to Firestore:", error);
  }
}, 1500);

export const loadInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
  if (storedTheme) return storedTheme;
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
  setInitialLoad: (uid: string | null) => Promise<void>;
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

const useAthkarStore = create<AthkarState & AthkarActions>()((set, get) => {
  
  const saveState = () => {
    const { uid, groups, athkarLog } = get();
    if (uid) {
      saveStateToFirestore(uid, { groups, athkarLog });
    }
  };

  return {
    groups: [],
    athkarLog: {},
    theme: 'light',
    isHydrated: false,
    uid: null,

    setInitialLoad: async (uid) => {
      if (get().isHydrated && get().uid === uid) return;
      if (!uid) {
        set({ uid: null, groups: [], athkarLog: {}, isHydrated: true, theme: loadInitialTheme() });
        return;
      }
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
      const newGroup: AthkarGroup = { id: Date.now().toString(), name, athkar: [] };
      set((state) => ({ groups: [...state.groups, newGroup] }));
      saveState();
    },

    editGroup: (id, newName) => {
      set((state) => ({
        groups: state.groups.map((g) => (g.id === id ? { ...g, name: newName } : g)),
      }));
      saveState();
    },

    deleteGroup: (id) => {
      set((state) => ({ groups: state.groups.filter((g) => g.id !== id) }));
      saveState();
    },

    reorderGroups: (startIndex, endIndex) => {
      set((state) => {
        const reorderedGroups = Array.from(state.groups);
        const [moved] = reorderedGroups.splice(startIndex, 1);
        reorderedGroups.splice(endIndex, 0, moved);
        return { groups: reorderedGroups };
      });
      saveState();
    },

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
      saveState();
      return newAthkarItem;
    },

    editAthkarInGroup: (groupId, athkarId, athkarData) => {
      set((state) => ({
        groups: state.groups.map((g) =>
          g.id === groupId
            ? { ...g, athkar: g.athkar.map((a) => (a.id === athkarId ? { ...a, ...athkarData } : a)) }
            : g
        ),
      }));
      saveState();
    },

    deleteAthkarFromGroup: (groupId, athkarId) => {
      set((state) => ({
        groups: state.groups.map((g) =>
          g.id === groupId ? { ...g, athkar: g.athkar.filter((a) => a.id !== athkarId) } : g
        ),
      }));
      saveState();
    },

    reorderAthkarInGroup: (groupId, startIndex, endIndex) => {
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
      }));
      saveState();
    },

    updateAthkarLog: (athkarArabic, amount) => {
      set((state) => {
        const newLog = { ...state.athkarLog };
        const currentCount = newLog[athkarArabic] || 0;
        newLog[athkarArabic] = Math.max(0, currentCount + amount);
        if (newLog[athkarArabic] === 0) {
          delete newLog[athkarArabic];
        }
        return { athkarLog: newLog };
      });
      saveState();
    },

    clearAthkarLog: () => {
      set({ athkarLog: {} });
      saveState();
    },

    deleteAthkarLogEntry: (athkarArabic) => {
      set((state) => {
        const newLog = { ...state.athkarLog };
        delete newLog[athkarArabic];
        return { athkarLog: newLog };
      });
      saveState();
    },

    toggleTheme: () => {
      set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        if (typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
          localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        }
        return { theme: newTheme };
      });
    },
  };
});

export { useAthkarStore };
