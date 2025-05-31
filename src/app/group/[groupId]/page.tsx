
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { StoredAthkar, AthkarGroup } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowRight, Plus, Loader2, RefreshCcw, Minus, ListFilter, Sun, Moon, Volume2, VolumeX, BellRing, BellOff } from 'lucide-react';
import { AthkarList } from '@/components/athkar/AthkarList';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';


const GROUPS_STORAGE_KEY = 'athkari_groups';
const ATHKAR_LOG_STORAGE_KEY = 'athkari_separate_log_data';
const THEME_STORAGE_KEY = 'athkari-theme';
const SOUND_STORAGE_KEY = 'athkari-sound-enabled';
const HAPTICS_STORAGE_KEY = 'athkari-haptics-enabled';


export interface AthkarInSession extends StoredAthkar {
  sessionProgress: number;
  isSessionHidden: boolean;
}

interface GroupInSession extends Omit<AthkarGroup, 'athkar'> {
  athkar: AthkarInSession[];
}

export default function GroupPage() {
  const router = useRouter();
  const params = useParams<{ groupId?: string }>();
  const groupId = params.groupId;

  const [group, setGroup] = useState<GroupInSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  const [isSortMode, setIsSortMode] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(true);

  const [isAddAthkarDialogOpen, setIsAddAthkarDialogOpen] = useState(false);
  const [newAthkarArabic, setNewAthkarArabic] = useState('');
  const [newAthkarVirtue, setNewAthkarVirtue] = useState('');
  const [newAthkarCount, setNewAthkarCount] = useState('');
  const [newAthkarReadingTime, setNewAthkarReadingTime] = useState('');

  const [isEditAthkarDialogOpen, setIsEditAthkarDialogOpen] = useState(false);
  const [editingAthkar, setEditingAthkar] = useState<AthkarInSession | null>(null);
  const [editedAthkarArabic, setEditedAthkarArabic] = useState('');
  const [editedAthkarVirtue, setEditedAthkarVirtue] = useState('');
  const [editedAthkarCount, setEditedAthkarCount] = useState('');
  const [editedAthkarReadingTime, setEditedAthkarReadingTime] = useState('');

  const [deletingAthkar, setDeletingAthkar] = useState<AthkarInSession | null>(null);

  const sessionCompletedAthkarIdsRef = useRef(new Set<string>());

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
      const initialTheme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      setTheme(initialTheme);
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const storedSound = localStorage.getItem(SOUND_STORAGE_KEY);
      setIsSoundEnabled(storedSound ? JSON.parse(storedSound) : true);
      const storedHaptics = localStorage.getItem(HAPTICS_STORAGE_KEY);
      setIsHapticsEnabled(storedHaptics ? JSON.parse(storedHaptics) : true);
    }
  }, [isClient]);

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


  useEffect(() => {
    if (isClient) {
      localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(isSoundEnabled));
    }
  }, [isSoundEnabled, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(HAPTICS_STORAGE_KEY, JSON.stringify(isHapticsEnabled));
    }
  }, [isHapticsEnabled, isClient]);

  const getStoredGroups = useCallback((): AthkarGroup[] => {
    if (!isClient) return [];
    const storedGroupsString = localStorage.getItem(GROUPS_STORAGE_KEY);
    if (storedGroupsString) {
      try {
        return JSON.parse(storedGroupsString) as AthkarGroup[];
      } catch (e) {
        console.error("Failed to parse groups from localStorage:", e);
      }
    }
    return [];
  }, [isClient]);

  const saveStoredGroupsToLocalStorage = useCallback((updatedGroups: AthkarGroup[]) => {
    if (!isClient) return;
    try {
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updatedGroups));
      console.log("GROUP_PAGE_SAVE_ALL_GROUPS: Saved all groups to localStorage", updatedGroups)
    } catch (e) {
      console.error("Failed to save groups to localStorage:", e);
    }
  }, [isClient]);
  
  const saveCurrentGroupStructure = useCallback((updatedGroupData: AthkarGroup) => {
    if (!isClient) return;
    const storedGroups = getStoredGroups();
    const groupIndex = storedGroups.findIndex(g => g.id === updatedGroupData.id);
    if (groupIndex !== -1) {
        storedGroups[groupIndex] = updatedGroupData;
    } else {
        console.warn("GROUP_PAGE: Attempted to save structure for a group not found in storedGroups. Adding it.", updatedGroupData);
        storedGroups.push(updatedGroupData);
    }
    saveStoredGroupsToLocalStorage(storedGroups);
  }, [isClient, getStoredGroups, saveStoredGroupsToLocalStorage]);


  const loadGroup = useCallback(() => {
    if (groupId && isClient) {
      setIsLoading(true);
      const storedGroups = getStoredGroups();
      const currentStoredGroup = storedGroups.find(g => g.id === groupId);

      if (currentStoredGroup) {
        const validAthkarArray = Array.isArray(currentStoredGroup.athkar) ? currentStoredGroup.athkar : [];
        const athkarInSession: AthkarInSession[] = validAthkarArray.map(thikr => ({
          ...thikr,
          sessionProgress: 0,
          isSessionHidden: false,
        }));
        setGroup({ ...currentStoredGroup, athkar: athkarInSession });
      } else {
        setGroup(null);
      }
      setIsLoading(false);
    }
  }, [groupId, isClient, getStoredGroups]);


  useEffect(() => {
    if (isClient && groupId) {
      loadGroup();
    }
  }, [isClient, groupId, loadGroup]);

  useEffect(() => {
    if (group?.id) {
      sessionCompletedAthkarIdsRef.current.clear();
      console.log(`SESSION_REF_LOG: Cleared sessionCompletedAthkarIdsRef for group ${group.id}`);
    }
  }, [group?.id]);


  const updateSeparateAthkarLog = useCallback((athkarArabic: string, amountToAdd: number) => {
    if (!isClient || amountToAdd <= 0) return;
    console.log(`LOG_UPDATE: Attempting to update separate log for "${athkarArabic}" by ${amountToAdd}`);
    try {
      const logString = localStorage.getItem(ATHKAR_LOG_STORAGE_KEY);
      let logData: Record<string, number> = {};
      if (logString) {
        try {
          logData = JSON.parse(logString);
        } catch (parseError) {
          console.error("Failed to parse Athkar log data from localStorage:", parseError);
          logData = {}; 
        }
      }
      const currentLoggedValue = logData[athkarArabic] || 0;
      logData[athkarArabic] = currentLoggedValue + amountToAdd;

      localStorage.setItem(ATHKAR_LOG_STORAGE_KEY, JSON.stringify(logData));
      console.log(`LOG_UPDATE: Successfully updated log for "${athkarArabic}". Old: ${currentLoggedValue}, Added: ${amountToAdd}, New total: ${logData[athkarArabic]}`);
    } catch (e) {
      console.error("Failed to update separate Athkar log in localStorage:", e);
    }
  }, [isClient]);


  const handleAddAthkar = useCallback(() => {
    if (!newAthkarArabic.trim() || !group) return;

    const count = parseInt(newAthkarCount, 10);
    const readingTime = parseInt(newAthkarReadingTime, 10);

    if (newAthkarCount.trim() && (isNaN(count) || count < 0)) return;
    if (newAthkarReadingTime.trim() && (isNaN(readingTime) || readingTime < 0)) return;

    const newStoredAthkarItem: StoredAthkar = {
      id: Date.now().toString(),
      arabic: newAthkarArabic.trim(),
      virtue: newAthkarVirtue.trim() || undefined,
      count: newAthkarCount.trim() ? count : undefined,
      readingTimeSeconds: newAthkarReadingTime.trim() ? readingTime : undefined,
    };

    const newAthkarInSession: AthkarInSession = {
      ...newStoredAthkarItem,
      sessionProgress: 0,
      isSessionHidden: false,
    };

    setGroup(prevGroup => {
      if (!prevGroup) return null;
      const updatedAthkarListForUI = [...prevGroup.athkar, newAthkarInSession];
      
      const groupToSave: AthkarGroup = {
        id: prevGroup.id,
        name: prevGroup.name,
        athkar: updatedAthkarListForUI.map(({ sessionProgress, isSessionHidden, ...storedThikr }) => storedThikr)
      };
      saveCurrentGroupStructure(groupToSave);
      return { ...prevGroup, athkar: updatedAthkarListForUI };
    });

    setNewAthkarArabic('');
    setNewAthkarVirtue('');
    setNewAthkarCount('');
    setNewAthkarReadingTime('');
    setIsAddAthkarDialogOpen(false);
  }, [newAthkarArabic, newAthkarCount, newAthkarReadingTime, newAthkarVirtue, group, saveCurrentGroupStructure]);

  const openEditAthkarDialog = useCallback((athkarToEdit: AthkarInSession) => {
    setEditingAthkar(athkarToEdit);
    setEditedAthkarArabic(athkarToEdit.arabic);
    setEditedAthkarVirtue(athkarToEdit.virtue || '');
    setEditedAthkarCount(athkarToEdit.count?.toString() || '');
    setEditedAthkarReadingTime(athkarToEdit.readingTimeSeconds?.toString() || '');
    setIsEditAthkarDialogOpen(true);
  }, []);

  const handleEditAthkar = useCallback(() => {
    if (!editingAthkar || !editedAthkarArabic.trim() || !group) return;

    const count = parseInt(editedAthkarCount, 10);
    const readingTime = parseInt(editedAthkarReadingTime, 10);

    if (editedAthkarCount.trim() && (isNaN(count) || count < 0)) return;
    if (editedAthkarReadingTime.trim() && (isNaN(readingTime) || readingTime < 0)) return;

    setGroup(prevGroup => {
      if (!prevGroup || !editingAthkar) return prevGroup;
      const updatedAthkarListForUI = prevGroup.athkar.map(a =>
        a.id === editingAthkar.id
          ? {
            ...a,
            arabic: editedAthkarArabic.trim(),
            virtue: editedAthkarVirtue.trim() || undefined,
            count: editedAthkarCount.trim() ? count : undefined,
            readingTimeSeconds: editedAthkarReadingTime.trim() ? readingTime : undefined,
          }
          : a
      );
      const groupToSave: AthkarGroup = {
        id: prevGroup.id,
        name: prevGroup.name,
        athkar: updatedAthkarListForUI.map(({ sessionProgress, isSessionHidden, ...storedThikr }) => storedThikr)
      };
      saveCurrentGroupStructure(groupToSave);
      return { ...prevGroup, athkar: updatedAthkarListForUI };
    });

    setIsEditAthkarDialogOpen(false);
    setEditingAthkar(null);
  }, [editingAthkar, editedAthkarArabic, editedAthkarCount, editedAthkarReadingTime, editedAthkarVirtue, group, saveCurrentGroupStructure]);

  const openDeleteAthkarDialog = useCallback((athkarToDelete: AthkarInSession) => {
    setDeletingAthkar(athkarToDelete);
  }, []);

  const handleDeleteAthkar = useCallback(() => {
    if (!deletingAthkar || !group) return;
    setGroup(prevGroup => {
      if (!prevGroup || !deletingAthkar) return prevGroup;
      const updatedAthkarListForUI = prevGroup.athkar.filter(a => a.id !== deletingAthkar.id);
      const groupToSave: AthkarGroup = {
        id: prevGroup.id,
        name: prevGroup.name,
        athkar: updatedAthkarListForUI.map(({ sessionProgress, isSessionHidden, ...storedThikr }) => storedThikr)
      };
      saveCurrentGroupStructure(groupToSave);
      return { ...prevGroup, athkar: updatedAthkarListForUI };
    });
    setDeletingAthkar(null);
  }, [deletingAthkar, group, saveCurrentGroupStructure]);


 const handleIncrementCount = useCallback((athkarId: string) => {
    setGroup(prevGroup => {
        if (!prevGroup) return null;

        const athkarIndex = prevGroup.athkar.findIndex(a => a.id === athkarId);
        if (athkarIndex === -1) return prevGroup;

        const currentThikr = prevGroup.athkar[athkarIndex];
        const targetCount = currentThikr.count || 1;
        const wasSessionHiddenPriorToThisUpdate = currentThikr.isSessionHidden;
        
        let newSessionProgress = currentThikr.sessionProgress;
        let newIsSessionHidden = currentThikr.isSessionHidden;

        // Only increment progress if the athkar is not already hidden in this session
        if (!wasSessionHiddenPriorToThisUpdate) {
            newSessionProgress = Math.min(currentThikr.sessionProgress + 1, targetCount);

            // Check if this increment completes the athkar FOR THIS SESSION
            if (newSessionProgress >= targetCount) {
                newIsSessionHidden = true; // Mark as hidden for the UI for this session

                // Log to persistent storage ONLY if not already logged this session
                if (!sessionCompletedAthkarIdsRef.current.has(athkarId)) {
                    console.log(`LOG_ACTION: Athkar ${currentThikr.id} (${currentThikr.arabic.substring(0,10)}) MET COMPLETION in session. Target: ${targetCount}. WILL LOG to persistent store.`);
                    updateSeparateAthkarLog(currentThikr.arabic, targetCount); // Log the targetCount
                    sessionCompletedAthkarIdsRef.current.add(athkarId); // Mark as logged for this session
                    console.log(`SESSION_REF_LOG: Added ${athkarId} to sessionCompletedAthkarIdsRef.`);
                } else {
                    console.log(`LOG_ACTION: Athkar ${currentThikr.id} (${currentThikr.arabic.substring(0,10)}) ALREADY LOGGED THIS SESSION (ref check). No new persistent log.`);
                }
            }
        } else {
             console.log(`LOG_ACTION: Athkar ${currentThikr.id} (${currentThikr.arabic.substring(0,10)}) is already session hidden. No progress increment or log action.`);
        }
        
        const updatedAthkar = {
            ...currentThikr,
            sessionProgress: newSessionProgress,
            isSessionHidden: newIsSessionHidden,
        };

        const updatedAthkarList = [...prevGroup.athkar];
        updatedAthkarList[athkarIndex] = updatedAthkar;
        
        return { ...prevGroup, athkar: updatedAthkarList };
    });
  }, [updateSeparateAthkarLog]);


  const handleDecrementCount = useCallback((athkarId: string) => {
    setGroup(prevGroup => {
      if (!prevGroup) return null;
      const updatedAthkarList = prevGroup.athkar.map(a => {
        if (a.id === athkarId) {
          const newSessionProgress = Math.max(0, a.sessionProgress - 1);
          const targetCount = a.count || 1;
          let newIsSessionHiddenForUI = a.isSessionHidden;

          // If it was hidden (completed in session) and now progress is less than target, unhide it
          if (a.isSessionHidden && newSessionProgress < targetCount) {
            newIsSessionHiddenForUI = false; 
            // If it was marked as logged this session, remove it from the session log, 
            // as it's no longer considered completed in this session.
            // Note: This does NOT undo the persistent log update. That's a one-way street for simplicity.
            if (sessionCompletedAthkarIdsRef.current.has(athkarId)) {
              sessionCompletedAthkarIdsRef.current.delete(athkarId);
              console.log(`SESSION_REF_LOG: Removed ${athkarId} from sessionCompletedAthkarIdsRef due to decrement.`);
            }
            console.log(`LOG_ACTION: Athkar ${a.id} (${a.arabic.substring(0, 10)}) UN-COMPLETED in session by decrement. UI visible again. Session log state reset for this athkar.`);
          }
          return { ...a, sessionProgress: newSessionProgress, isSessionHidden: newIsSessionHiddenForUI };
        }
        return a;
      });
      return { ...prevGroup, athkar: updatedAthkarList };
    });
  }, []);

  const handleToggleComplete = useCallback((athkarId: string) => {
    setGroup(prevGroup => {
      if (!prevGroup) return null;

      const athkarIndex = prevGroup.athkar.findIndex(a => a.id === athkarId);
      if (athkarIndex === -1) return prevGroup;

      const currentThikr = prevGroup.athkar[athkarIndex];
      // This toggle is for athkar without a count or count is 1
      if (currentThikr.count && currentThikr.count > 1) return prevGroup; 

      const wasSessionHiddenPriorToThisToggle = currentThikr.isSessionHidden;
      const newIsSessionHiddenForUI = !wasSessionHiddenPriorToThisToggle;

      // If it's now completed in session (transitioned from not hidden to hidden)
      if (newIsSessionHiddenForUI && !wasSessionHiddenPriorToThisToggle) {
         // Log to persistent storage ONLY if not already logged this session
        if (!sessionCompletedAthkarIdsRef.current.has(athkarId)) {
          console.log(`LOG_ACTION: Athkar ${currentThikr.id} (${currentThikr.arabic.substring(0, 10)}) (toggleable) COMPLETED in session. WILL LOG 1 to persistent store.`);
          updateSeparateAthkarLog(currentThikr.arabic, 1); // Log 1 for toggleable completion
          sessionCompletedAthkarIdsRef.current.add(athkarId);
          console.log(`SESSION_REF_LOG: Added ${athkarId} to sessionCompletedAthkarIdsRef.`);
        } else {
          console.log(`LOG_ACTION: Athkar ${currentThikr.id} (${currentThikr.arabic.substring(0, 10)}) (toggleable) ALREADY LOGGED THIS SESSION (ref check). No new persistent log.`);
        }
      }
      // If it's now un-completed in session (transitioned from hidden to not hidden)
      else if (!newIsSessionHiddenForUI && wasSessionHiddenPriorToThisToggle) {
         // Remove from session log, as it's no longer considered completed in this session.
         // Note: This does NOT undo the persistent log update.
        if (sessionCompletedAthkarIdsRef.current.has(athkarId)) {
          sessionCompletedAthkarIdsRef.current.delete(athkarId);
          console.log(`SESSION_REF_LOG: Removed ${athkarId} from sessionCompletedAthkarIdsRef due to toggle un-complete.`);
        }
        console.log(`LOG_ACTION: Athkar ${currentThikr.id} (${currentThikr.arabic.substring(0, 10)}) (toggleable) UN-COMPLETED in session. UI visible. Session log state reset for this athkar.`);
      }

      const updatedAthkar = {
        ...currentThikr,
        isSessionHidden: newIsSessionHiddenForUI,
        // For toggleable, sessionProgress mirrors completion state (0 or 1, or targetCount if exists)
        sessionProgress: newIsSessionHiddenForUI ? (currentThikr.count || 1) : 0
      };
      const updatedAthkarList = [...prevGroup.athkar];
      updatedAthkarList[athkarIndex] = updatedAthkar;

      return { ...prevGroup, athkar: updatedAthkarList };
    });
  }, [updateSeparateAthkarLog]);

  const handleResetAllAthkar = useCallback(() => {
    setGroup(prevGroup => {
      if (!prevGroup) return null;
      const updatedAthkarList = prevGroup.athkar.map(a => ({
        ...a,
        sessionProgress: 0,
        isSessionHidden: false,
      }));
      console.log("SESSION_RESET: All Athkar in current group session reset. Separate log NOT affected. Session completion ref cleared.");
      return { ...prevGroup, athkar: updatedAthkarList };
    });
    sessionCompletedAthkarIdsRef.current.clear();
  }, []);

  const onDragEndAthkar = useCallback((result: DropResult) => {
    if (!result.destination || !group) return;
    setGroup(prevGroup => {
      if (!prevGroup || !result.destination) return prevGroup;
      if (result.destination.index === result.source.index) return prevGroup;

      const reorderedAthkarForUI = Array.from(prevGroup.athkar);
      const [movedAthkar] = reorderedAthkarForUI.splice(result.source.index, 1);
      reorderedAthkarForUI.splice(result.destination.index, 0, movedAthkar);

      const groupToSave: AthkarGroup = {
        id: prevGroup.id,
        name: prevGroup.name,
        athkar: reorderedAthkarForUI.map(({ sessionProgress, isSessionHidden, ...storedThikr }) => storedThikr)
      };
      saveCurrentGroupStructure(groupToSave);
      return { ...prevGroup, athkar: reorderedAthkarForUI };
    });
  }, [group, saveCurrentGroupStructure]);

  const handleIncrementFontSize = useCallback(() => {
    setFontSizeMultiplier(prev => Math.min(prev + 0.1, 2));
  }, []);

  const handleDecrementFontSize = useCallback(() => {
    setFontSizeMultiplier(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const toggleSortMode = useCallback(() => {
    setIsSortMode(prev => !prev);
  }, []);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev);
  }, []);

  const toggleHaptics = useCallback(() => {
    setIsHapticsEnabled(prev => !prev);
  }, []);

  if (!isClient || isLoading) {
    return (
      <div dir="rtl" className="flex flex-col justify-center items-center min-h-screen bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">جاري تحميل المجموعة...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div dir="rtl" className="flex flex-col justify-center items-center min-h-screen p-4 bg-background text-foreground">
        <p className="text-xl text-destructive mb-6">لم يتم العثور على المجموعة المطلوبة.</p>
        <Button onClick={() => router.push('/')} variant="outline">
          <ArrowRight className="ml-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />
          العودة إلى الرئيسية
        </Button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex flex-col items-center p-4 md:p-8 animate-slide-in-from-right flex-grow">
        <header className="w-full max-w-4xl mb-4 flex justify-between items-center">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button onClick={() => router.push('/')} variant="outline" size="icon" aria-label="العودة للرئيسية">
              <ArrowRight className="h-4 w-4" />
            </Button>
            {isClient && (
              <>
                <Button
                  onClick={toggleTheme}
                  variant="outline"
                  size="icon"
                  aria-label={theme === 'light' ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}
                >
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={toggleSound}
                  variant="outline"
                  size="icon"
                  aria-label={isSoundEnabled ? "تعطيل الصوت" : "تفعيل الصوت"}
                >
                  {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={toggleHaptics}
                  variant="outline"
                  size="icon"
                  aria-label={isHapticsEnabled ? "تعطيل الاهتزاز" : "تفعيل الاهتزاز"}
                >
                  {isHapticsEnabled ? <BellRing className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>

          {/* Spacer for centering the title, title will be below */}
          <div className="flex-grow px-2"></div>


          <div className="flex items-center gap-1 sm:gap-2">
            <Button onClick={handleDecrementFontSize} variant="outline" size="icon" aria-label="تصغير الخط">
              <Minus className="h-4 w-4" />
            </Button>
            <Button onClick={handleIncrementFontSize} variant="outline" size="icon" aria-label="تكبير الخط">
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              onClick={toggleSortMode}
              variant={isSortMode ? "secondary" : "outline"}
              size="icon"
              aria-label={isSortMode ? "الخروج من وضع الترتيب" : "الدخول إلى وضع الترتيب"}
              className={isSortMode ? "bg-accent text-accent-foreground" : ""}
            >
              <ListFilter className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleResetAllAthkar}
              variant="outline"
              size="icon"
              className="hover:bg-destructive hover:text-destructive-foreground"
              aria-label="إعادة تعيين الأذكار لهذه الجلسة (لا يؤثر على السجل الدائم)"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="w-full max-w-4xl text-center my-3 sm:my-4"> {/* Adjusted margin */}
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary truncate px-2" title={group.name}>
            {group.name}
          </h1>
        </div>

        {isClient && (
          <DragDropContext onDragEnd={onDragEndAthkar}>
            <main className="w-full max-w-2xl flex-grow">
              <AthkarList
                athkarList={group.athkar}
                onToggleComplete={handleToggleComplete}
                onIncrementCount={handleIncrementCount}
                onDecrementCount={handleDecrementCount}
                onEditAthkar={openEditAthkarDialog}
                onDeleteAthkar={openDeleteAthkarDialog}
                fontSizeMultiplier={fontSizeMultiplier}
                isSortMode={isSortMode}
              />
            </main>
          </DragDropContext>
        )}
        {editingAthkar && (
          <Dialog open={isEditAthkarDialogOpen} onOpenChange={(open) => {
            if (!open) setEditingAthkar(null);
            setIsEditAthkarDialogOpen(open);
          }}>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>تعديل الذكر</DialogTitle>
                <DialogDescription>
                  قم بتعديل تفاصيل الذكر.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-athkar-arabic">نص الذكر (بالعربية)</Label>
                  <Textarea
                    id="edit-athkar-arabic"
                    value={editedAthkarArabic}
                    onChange={(e) => setEditedAthkarArabic(e.target.value)}
                    lang="ar"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-athkar-virtue">فضل الذكر (اختياري)</Label>
                  <Textarea
                    id="edit-athkar-virtue"
                    value={editedAthkarVirtue}
                    onChange={(e) => setEditedAthkarVirtue(e.target.value)}
                    lang="ar"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-athkar-count">عدد التكرار (اختياري)</Label>
                    <Input
                      id="edit-athkar-count"
                      type="number"
                      value={editedAthkarCount}
                      onChange={(e) => setEditedAthkarCount(e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-athkar-reading-time">زمن القراءة/ثانية (اختياري)</Label>
                    <Input
                      id="edit-athkar-reading-time"
                      type="number"
                      value={editedAthkarReadingTime}
                      onChange={(e) => setEditedAthkarReadingTime(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => { setIsEditAthkarDialogOpen(false); setEditingAthkar(null); }}>إلغاء</Button>
                </DialogClose>
                <Button onClick={handleEditAthkar}>حفظ التعديلات</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {deletingAthkar && (
          <AlertDialog open={!!deletingAthkar} onOpenChange={(open) => { if (!open) setDeletingAthkar(null); }}>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد من حذف هذا الذكر؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف الذكر "{deletingAthkar.arabic.substring(0, 20)}..." بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingAthkar(null)}>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAthkar}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  نعم، حذف الذكر
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <Dialog open={isAddAthkarDialogOpen} onOpenChange={setIsAddAthkarDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-8 right-8 rtl:left-8 rtl:right-auto h-16 w-16 rounded-full shadow-lg z-50 text-2xl bg-accent hover:bg-accent/90 text-accent-foreground"
            size="icon"
            aria-label="إضافة ذكر جديد"
          >
            <Plus size={32} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة ذكر جديد إلى "{group?.name || 'المجموعة'}"</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل الذكر الجديد ليتم إضافته إلى هذه المجموعة.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-athkar-arabic">نص الذكر (بالعربية)</Label>
              <Textarea
                id="add-athkar-arabic"
                value={newAthkarArabic}
                onChange={(e) => setNewAthkarArabic(e.target.value)}
                placeholder="سبحان الله وبحمده..."
                lang="ar"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-athkar-virtue">فضل الذكر (اختياري)</Label>
              <Textarea
                id="add-athkar-virtue"
                value={newAthkarVirtue}
                onChange={(e) => setNewAthkarVirtue(e.target.value)}
                placeholder="مثال: من قاله مائة مرة حطت خطاياه..."
                lang="ar"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-athkar-count">عدد التكرار (اختياري)</Label>
                <Input
                  id="add-athkar-count"
                  type="number"
                  value={newAthkarCount}
                  onChange={(e) => setNewAthkarCount(e.target.value)}
                  placeholder="مثال: 3 أو 100"
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-athkar-reading-time">زمن القراءة/ثانية (اختياري)</Label>
                <Input
                  id="add-athkar-reading-time"
                  type="number"
                  value={newAthkarReadingTime}
                  onChange={(e) => setNewAthkarReadingTime(e.target.value)}
                  placeholder="مثال: 15"
                  min="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleAddAthkar}>حفظ الذكر</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
