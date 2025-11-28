
"use client";

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AthkarGroup, Athkar, AthkarLogStore } from '@/types';

const GROUPS_STORAGE_KEY = 'athkari_groups';
const ATHKAR_LOG_STORAGE_KEY = 'athkari_separate_log_data';
const THEME_STORAGE_KEY = 'athkari-theme';

interface AthkarContextType {
  groups: AthkarGroup[];
  athkarLog: AthkarLogStore;
  isInitialLoading: boolean;
  theme: 'light' | 'dark';
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
}

export const AthkarContext = createContext<AthkarContextType | null>(null);

export function AthkarProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<AthkarGroup[]>([]);
  const [athkarLog, setAthkarLog] = useState<AthkarLogStore>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load initial data from localStorage
  useEffect(() => {
    try {
      const storedGroupsString = localStorage.getItem(GROUPS_STORAGE_KEY);
      if (storedGroupsString) {
        const parsedGroups = JSON.parse(storedGroupsString) as AthkarGroup[];
        const normalizedGroups = parsedGroups.map(group => ({
            ...group,
            athkar: group.athkar || [], 
        }));
        setGroups(normalizedGroups);
      }

      const logString = localStorage.getItem(ATHKAR_LOG_STORAGE_KEY);
      if (logString) {
        setAthkarLog(JSON.parse(logString));
      }

      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
      const initialTheme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      setTheme(initialTheme);
      if (initialTheme === 'dark') {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Persist groups to localStorage
  useEffect(() => {
    if (!isInitialLoading) {
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
    }
  }, [groups, isInitialLoading]);

  // Persist athkarLog to localStorage
  useEffect(() => {
    if (!isInitialLoading) {
      localStorage.setItem(ATHKAR_LOG_STORAGE_KEY, JSON.stringify(athkarLog));
    }
  }, [athkarLog, isInitialLoading]);

  // Persist theme to localStorage
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      return newTheme;
    });
  }, []);

  const addGroup = useCallback((name: string) => {
    const newGroup: AthkarGroup = {
      id: Date.now().toString(),
      name: name,
      athkar: [],
    };
    setGroups(prev => [...prev, newGroup]);
  }, []);

  const editGroup = useCallback((id: string, newName: string) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, name: newName } : g));
  }, []);

  const deleteGroup = useCallback((id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  }, []);

  const reorderGroups = useCallback((startIndex: number, endIndex: number) => {
    setGroups(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const getGroupById = useCallback((id: string) => {
    return groups.find(g => g.id === id);
  }, [groups]);

  const addAthkarToGroup = useCallback((groupId: string, athkarData: Omit<Athkar, 'id'>) => {
    const newAthkarItem: Athkar = {
        id: Date.now().toString() + Math.random().toString(),
        ...athkarData,
    };
    setGroups(prev => prev.map(g => 
        g.id === groupId 
        ? { ...g, athkar: [...g.athkar, newAthkarItem] }
        : g
    ));
    return newAthkarItem;
  }, []);

  const editAthkarInGroup = useCallback((groupId: string, athkarId: string, athkarData: Partial<Athkar>) => {
    setGroups(prev => prev.map(g => 
        g.id === groupId
        ? { ...g, athkar: g.athkar.map(a => a.id === athkarId ? { ...a, ...athkarData } : a) }
        : g
    ));
  }, []);

  const deleteAthkarFromGroup = useCallback((groupId: string, athkarId: string) => {
    setGroups(prev => prev.map(g =>
        g.id === groupId
        ? { ...g, athkar: g.athkar.filter(a => a.id !== athkarId) }
        : g
    ));
  }, []);
  
  const reorderAthkarInGroup = useCallback((groupId: string, startIndex: number, endIndex: number) => {
     setGroups(prev => prev.map(g => {
        if (g.id === groupId) {
            const reorderedAthkar = Array.from(g.athkar);
            const [moved] = reorderedAthkar.splice(startIndex, 1);
            reorderedAthkar.splice(endIndex, 0, moved);
            return { ...g, athkar: reorderedAthkar };
        }
        return g;
     }));
  }, []);

  const updateAthkarLog = useCallback((athkarArabic: string, amount: number) => {
    setAthkarLog(prev => {
      const newLog = { ...prev };
      const currentCount = newLog[athkarArabic] || 0;
      newLog[athkarArabic] = Math.max(0, currentCount + amount);
      if (newLog[athkarArabic] === 0) {
        delete newLog[athkarArabic];
      }
      return newLog;
    });
  }, []);

  const clearAthkarLog = useCallback(() => {
    setAthkarLog({});
  }, []);

  const deleteAthkarLogEntry = useCallback((athkarArabic: string) => {
    setAthkarLog(prev => {
      const newLog = { ...prev };
      delete newLog[athkarArabic];
      return newLog;
    });
  }, []);

  const value = {
    groups,
    athkarLog,
    isInitialLoading,
    theme,
    addGroup,
    editGroup,
    deleteGroup,
    reorderGroups,
    getGroupById,
    addAthkarToGroup,
    editAthkarInGroup,
    deleteAthkarFromGroup,
    reorderAthkarInGroup,
    updateAthkarLog,
    clearAthkarLog,
    deleteAthkarLogEntry,
    toggleTheme,
  };

  return (
    <AthkarContext.Provider value={value}>
      {children}
    </AthkarContext.Provider>
  );
}
