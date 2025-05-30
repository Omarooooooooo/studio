
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { AthkarGroup, StoredAthkar, AthkarLogStore } from '@/types';
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
import { ArrowRight, Plus, Loader2, RefreshCcw, Minus, ListFilter, Sun, Moon, Volume2, VolumeX, BellRing, BellOff, GripVertical } from 'lucide-react';
import { AthkarList } from '@/components/athkar/AthkarList';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';


const GROUPS_STORAGE_KEY = 'athkari_groups';
const ATHKAR_LOG_STORAGE_KEY = 'athkari_separate_log_data'; // Unified key
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
  const { groupId } = useParams<{ groupId?: string }>();


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

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
      const storedSound = localStorage.getItem(SOUND_STORAGE_KEY);
      setIsSoundEnabled(storedSound ? JSON.parse(storedSound) : true);
      const storedHaptics = localStorage.getItem(HAPTICS_STORAGE_KEY);
      setIsHapticsEnabled(storedHaptics ? JSON.parse(storedHaptics) : true);
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme, isClient]);

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
    if (typeof window === 'undefined') return [];
    const storedGroupsString = localStorage.getItem(GROUPS_STORAGE_KEY);
    if (storedGroupsString) {
      try {
        return JSON.parse(storedGroupsString) as AthkarGroup[];
      } catch (e) {
        console.error("Failed to parse groups from localStorage:", e);
        return [];
      }
    }
    return [];
  }, []);

  const saveStoredGroupsToLocalStorage = useCallback((updatedGroups: AthkarGroup[]) => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updatedGroups));
        } catch (e) {
            console.error("Failed to save groups to localStorage:", e);
        }
    }
  }, []);
  
  const saveCurrentGroupStructureRef = useRef((updatedGroup: GroupInSession | null) => {
    if (!updatedGroup || typeof window === 'undefined') return;
    const storedGroups = getStoredGroups();
    const groupToSave: AthkarGroup = {
      ...updatedGroup,
      // Ensure we only save the StoredAthkar structure, not session-specific fields
      athkar: updatedGroup.athkar.map(({ sessionProgress, isSessionHidden, ...storedThikr }) => storedThikr)
    };
    const groupIndex = storedGroups.findIndex(g => g.id === groupToSave.id);
    if (groupIndex !== -1) {
      storedGroups[groupIndex] = groupToSave;
    } else {
       storedGroups.push(groupToSave); 
    }
    saveStoredGroupsToLocalStorage(storedGroups);
  });


  const loadGroup = useCallback(() => {
    if (groupId && typeof window !== 'undefined') {
      setIsLoading(true);
      const storedGroups = getStoredGroups();
      const currentStoredGroup = storedGroups.find(g => g.id === groupId);
      if (currentStoredGroup) {
        const athkarInSession: AthkarInSession[] = (currentStoredGroup.athkar || []).map(thikr => ({
          ...thikr,
          sessionProgress: 0, // Initialize session progress
          isSessionHidden: false, // Initialize session hidden state
        }));
        setGroup({ ...currentStoredGroup, athkar: athkarInSession });
      } else {
        setGroup(null);
      }
    }
    setIsLoading(false);
  }, [groupId, getStoredGroups]);

  useEffect(() => {
    if(isClient && groupId){
        loadGroup();
    }
  }, [loadGroup, isClient, groupId]);

  const updateSeparateAthkarLog = useCallback((athkarArabic: string, repetitionsToAdd: number) => {
    if (typeof window === 'undefined' || repetitionsToAdd <= 0) return;
    console.log(`LOG_UPDATE: Attempting to update separate log for "${athkarArabic}" by ${repetitionsToAdd}`);
    try {
      const logString = localStorage.getItem(ATHKAR_LOG_STORAGE_KEY);
      let logData: AthkarLogStore = {};
      if (logString) {
        try {
          logData = JSON.parse(logString);
        } catch (parseError) {
          console.error("Failed to parse Athkar log data from localStorage:", parseError);
          logData = {}; 
        }
      }
      logData[athkarArabic] = (logData[athkarArabic] || 0) + repetitionsToAdd;
      localStorage.setItem(ATHKAR_LOG_STORAGE_KEY, JSON.stringify(logData));
      console.log(`LOG_UPDATE: Successfully updated log. New total for "${athkarArabic}": ${logData[athkarArabic]}`);
    } catch (e) {
      console.error("Failed to update separate Athkar log in localStorage:", e);
    }
  }, []);


  const handleAddAthkar = useCallback(() => {
    if (!newAthkarArabic.trim()) return;
    
    const count = parseInt(newAthkarCount, 10);
    const readingTime = parseInt(newAthkarReadingTime, 10);

    if (newAthkarCount.trim() && (isNaN(count) || count < 0)) return;
    if (newAthkarReadingTime.trim() && (isNaN(readingTime) || readingTime < 0)) return;

    // This is the structure stored in the group's athkar list
    const newStoredAthkar: StoredAthkar = {
      id: Date.now().toString(),
      arabic: newAthkarArabic.trim(),
      virtue: newAthkarVirtue.trim() || undefined,
      count: newAthkarCount.trim() ? count : undefined,
      readingTimeSeconds: newAthkarReadingTime.trim() ? readingTime : undefined,
    };

    const newAthkarInSession: AthkarInSession = {
        ...newStoredAthkar,
        sessionProgress: 0,
        isSessionHidden: false,
    };

    setGroup(prevGroup => {
      if (!prevGroup) return null;
      const updatedAthkar = [...prevGroup.athkar, newAthkarInSession];
      const updatedGroup = { ...prevGroup, athkar: updatedAthkar };
      saveCurrentGroupStructureRef.current(updatedGroup);
      return updatedGroup;
    });

    setNewAthkarArabic('');
    setNewAthkarVirtue('');
    setNewAthkarCount('');
    setNewAthkarReadingTime('');
    setIsAddAthkarDialogOpen(false);
  }, [newAthkarArabic, newAthkarCount, newAthkarReadingTime, newAthkarVirtue, saveCurrentGroupStructureRef]);

  const openEditAthkarDialog = useCallback((athkarToEdit: AthkarInSession) => {
    setEditingAthkar(athkarToEdit);
    setEditedAthkarArabic(athkarToEdit.arabic);
    setEditedAthkarVirtue(athkarToEdit.virtue || '');
    setEditedAthkarCount(athkarToEdit.count?.toString() || '');
    setEditedAthkarReadingTime(athkarToEdit.readingTimeSeconds?.toString() || '');
    setIsEditAthkarDialogOpen(true);
  }, []);

  const handleEditAthkar = useCallback(() => {
    if (!editingAthkar || !editedAthkarArabic.trim()) return;

    const count = parseInt(editedAthkarCount, 10);
    const readingTime = parseInt(editedAthkarReadingTime, 10);

    if (editedAthkarCount.trim() && (isNaN(count) || count < 0)) return;
    if (editedAthkarReadingTime.trim() && (isNaN(readingTime) || readingTime < 0)) return;
    
    setGroup(prevGroup => {
      if (!prevGroup || !editingAthkar) return prevGroup;
      const updatedAthkarList = prevGroup.athkar.map(a =>
        a.id === editingAthkar.id
        ? {
            ...a, // Keep sessionProgress and isSessionHidden
            arabic: editedAthkarArabic.trim(),
            virtue: editedAthkarVirtue.trim() || undefined,
            count: editedAthkarCount.trim() ? count : undefined,
            readingTimeSeconds: editedAthkarReadingTime.trim() ? readingTime : undefined,
          }
        : a
      );
      const updatedGroup = { ...prevGroup, athkar: updatedAthkarList };
      saveCurrentGroupStructureRef.current(updatedGroup); // Save the structure change
      return updatedGroup;
    });

    setIsEditAthkarDialogOpen(false);
    setEditingAthkar(null);
  }, [editingAthkar, editedAthkarArabic, editedAthkarCount, editedAthkarReadingTime, editedAthkarVirtue, saveCurrentGroupStructureRef]);

  const openDeleteAthkarDialog = useCallback((athkarToDelete: AthkarInSession) => {
    setDeletingAthkar(athkarToDelete);
  }, []);

  const handleDeleteAthkar = useCallback(() => {
    if (!deletingAthkar) return;
     setGroup(prevGroup => {
        if (!prevGroup || !deletingAthkar) return prevGroup;
        const updatedAthkarList = prevGroup.athkar.filter(a => a.id !== deletingAthkar.id);
        const updatedGroup = { ...prevGroup, athkar: updatedAthkarList };
        saveCurrentGroupStructureRef.current(updatedGroup);
        return updatedGroup;
     });
    setDeletingAthkar(null);
  }, [deletingAthkar, saveCurrentGroupStructureRef]);


 const handleIncrementCount = useCallback((athkarId: string) => {
    setGroup(prevGroup => {
      if (!prevGroup) return null;

      let needsLogUpdate = false;
      let logAmount = 0;
      let logArabic = "";

      const updatedAthkarList = prevGroup.athkar.map(thikr => {
        if (thikr.id === athkarId) {
          const targetCount = thikr.count || 1;
          const oldSessionProgress = thikr.sessionProgress;
          const oldIsSessionHidden = thikr.isSessionHidden;

          if (oldIsSessionHidden) { // Already completed and hidden in this session, no change to progress or log
            console.log(`LOG_ACTION: Athkar ${thikr.id} (${thikr.arabic.substring(0,10)}) already hidden this session. No change.`);
            return thikr;
          }

          const newSessionProgress = Math.min(oldSessionProgress + 1, targetCount);
          let newIsSessionHidden = oldIsSessionHidden; // Default to old, change if completed

          // Check if this increment completes the thikr FOR THE FIRST TIME in this session
          if (!oldIsSessionHidden && newSessionProgress >= targetCount) {
            newIsSessionHidden = true; // Mark as hidden for this session
            needsLogUpdate = true;    // Flag that the permanent log needs updating
            logAmount = targetCount;  // The amount to add to the permanent log is the full cycle count
            logArabic = thikr.arabic;
            console.log(`LOG_ACTION: Athkar ${thikr.id} (${thikr.arabic.substring(0,10)}) MET COMPLETION in session. Log Amount: ${logAmount}`);
          }
          
          return { ...thikr, sessionProgress: newSessionProgress, isSessionHidden: newIsSessionHidden };
        }
        return thikr;
      });

      // Call log update outside the map, only if flagged
      if (needsLogUpdate && logArabic) {
        console.log(`LOG_ACTION: Calling updateSeparateAthkarLog for "${logArabic}" with amount: ${logAmount}`);
        updateSeparateAthkarLog(logArabic, logAmount);
      }

      return { ...prevGroup, athkar: updatedAthkarList };
    });
  }, [updateSeparateAthkarLog]);


  const handleDecrementCount = useCallback((athkarId: string) => {
    setGroup(prevGroup => {
      if (!prevGroup) return null;
      const updatedAthkarList = prevGroup.athkar.map(a => {
        if (a.id === athkarId) {
          const oldSessionProgress = a.sessionProgress;
          const newSessionProgress = Math.max(0, oldSessionProgress - 1);
          const targetCount = a.count || 1;
          let newIsSessionHidden = a.isSessionHidden;

          // If it was hidden (completed) and now progress is less than target, unhide it for the session
          if (a.isSessionHidden && newSessionProgress < targetCount) {
            newIsSessionHidden = false;
          }
          // Note: Decrementing does not affect the permanent log.
          return { ...a, sessionProgress: newSessionProgress, isSessionHidden: newIsSessionHidden };
        }
        return a;
      });
      return { ...prevGroup, athkar: updatedAthkarList };
    });
  }, []);

  const handleToggleComplete = useCallback((athkarId: string) => {
    setGroup(prevGroup => {
        if (!prevGroup) return null;
        
        let needsLogUpdate = false;
        let logAmount = 0;
        let logArabic = "";

        const updatedAthkarList = prevGroup.athkar.map(thikr => {
            if (thikr.id === athkarId && (!thikr.count || thikr.count <= 1)) { // Only for toggleable (count 1 or undefined)
                const oldIsSessionHidden = thikr.isSessionHidden;
                const newIsSessionHidden = !oldIsSessionHidden; // Toggle the session hidden state

                // Log only if transitioning from not hidden to hidden (i.e., just completed in this session)
                if (!oldIsSessionHidden && newIsSessionHidden) {
                    needsLogUpdate = true;
                    logAmount = 1; // For toggleable, one completion cycle is 1
                    logArabic = thikr.arabic;
                    console.log(`LOG_ACTION: Athkar ${thikr.id} (${thikr.arabic.substring(0,10)}) (toggleable) COMPLETED in session. Log Amount: ${logAmount}`);
                }
                 return {
                    ...thikr,
                    isSessionHidden: newIsSessionHidden,
                    sessionProgress: newIsSessionHidden ? (thikr.count || 1) : 0 
                };
            }
            return thikr;
        });

        if (needsLogUpdate && logArabic) {
            console.log(`LOG_ACTION: Calling updateSeparateAthkarLog for "${logArabic}" with amount: ${logAmount}`);
            updateSeparateAthkarLog(logArabic, logAmount);
        }
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
      // This only resets the current session's view. It does NOT affect the permanent log.
      console.log("SESSION_RESET: All Athkar in current group session reset. Separate log is NOT affected.");
      return { ...prevGroup, athkar: updatedAthkarList };
    });
  }, []);

  const onDragEndAthkar = useCallback((result: DropResult) => {
    if (!result.destination) return;
     setGroup(prevGroup => {
      if (!prevGroup || !result.destination) return prevGroup;
      if (result.destination.index === result.source.index) return prevGroup;

      const reorderedAthkar = Array.from(prevGroup.athkar);
      const [movedAthkar] = reorderedAthkar.splice(result.source.index, 1);
      reorderedAthkar.splice(result.destination.index, 0, movedAthkar);

      const updatedGroup = { ...prevGroup, athkar: reorderedAthkar };
      saveCurrentGroupStructureRef.current(updatedGroup);
      return updatedGroup;
    });
  }, [saveCurrentGroupStructureRef]);

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
    <div dir="rtl" className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background text-foreground">
        <header className="w-full max-w-4xl mb-4 flex justify-between items-center">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button onClick={() => router.push('/')} variant="outline" size="icon" aria-label="العودة للرئيسية">
              <ArrowRight className="h-4 w-4" />
            </Button>
            {isClient && (
              <>
                <Button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
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

        <div className="w-full max-w-4xl text-center mb-6">
            <h1 className="text-3xl font-bold text-primary truncate px-2" title={group.name}>
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
            <DialogTitle>إضافة ذكر جديد إلى "{group.name}"</DialogTitle>
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
                <Button variant="outline" onClick={() => {setIsEditAthkarDialogOpen(false); setEditingAthkar(null);}}>إلغاء</Button>
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
                سيتم حذف الذكر "{deletingAthkar.arabic.substring(0,20)}..." بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
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
  );
}

    