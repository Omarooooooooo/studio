
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { AthkarGroup, Athkar } from '@/types';
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
import { useToast } from "@/hooks/use-toast";
import { AthkarList } from '@/components/athkar/AthkarList';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';

const LOCAL_STORAGE_KEY = 'athkari_groups';
const THEME_STORAGE_KEY = 'athkari-theme';
const SOUND_STORAGE_KEY = 'athkari-sound-enabled';
const HAPTICS_STORAGE_KEY = 'athkari-haptics-enabled';

export default function GroupPage() {
  const router = useRouter();
  const { groupId: rawGroupId } = useParams() as { groupId: string };
  const groupId = rawGroupId;

  const [group, setGroup] = useState<AthkarGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  const [isSortMode, setIsSortMode] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(true);


  // Add Athkar Dialog State
  const [isAddAthkarDialogOpen, setIsAddAthkarDialogOpen] = useState(false);
  const [newAthkarArabic, setNewAthkarArabic] = useState('');
  const [newAthkarVirtue, setNewAthkarVirtue] = useState('');
  const [newAthkarCount, setNewAthkarCount] = useState('');
  const [newAthkarReadingTime, setNewAthkarReadingTime] = useState('');

  // Edit Athkar Dialog State
  const [isEditAthkarDialogOpen, setIsEditAthkarDialogOpen] = useState(false);
  const [editingAthkar, setEditingAthkar] = useState<Athkar | null>(null);
  const [editedAthkarArabic, setEditedAthkarArabic] = useState('');
  const [editedAthkarVirtue, setEditedAthkarVirtue] = useState('');
  const [editedAthkarCount, setEditedAthkarCount] = useState('');
  const [editedAthkarReadingTime, setEditedAthkarReadingTime] = useState('');

  // Delete Athkar Dialog State
  const [deletingAthkar, setDeletingAthkar] = useState<Athkar | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      // Theme
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
      // Sound
      const storedSound = localStorage.getItem(SOUND_STORAGE_KEY);
      setIsSoundEnabled(storedSound ? JSON.parse(storedSound) : true);
      // Haptics
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


  const saveGroupsToLocalStorage = useCallback((allGroups: AthkarGroup[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allGroups));
    }
  }, []);
  
  const saveCurrentGroup = useCallback((updatedGroup: AthkarGroup | null) => {
      if (!updatedGroup || typeof window === 'undefined') return;
      const storedGroupsString = localStorage.getItem(LOCAL_STORAGE_KEY);
      let storedGroups: AthkarGroup[] = [];
      if (storedGroupsString) {
        try {
          storedGroups = JSON.parse(storedGroupsString);
        } catch (e) {
          console.error("Failed to parse groups from localStorage during save:", e);
          // Do not toast here as it might be too frequent
          return;
        }
      }
      const groupIndex = storedGroups.findIndex(g => g.id === updatedGroup.id);
      if (groupIndex !== -1) {
        storedGroups[groupIndex] = updatedGroup;
      } else {
         storedGroups.push(updatedGroup);
      }
      saveGroupsToLocalStorage(storedGroups);
  }, [saveGroupsToLocalStorage]);

  const saveCurrentGroupRef = useRef(saveCurrentGroup);
   useEffect(() => {
    saveCurrentGroupRef.current = saveCurrentGroup;
  }, [saveCurrentGroup]);


  const loadGroup = useCallback(() => {
    if (groupId && typeof window !== 'undefined') {
      const storedGroupsString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedGroupsString) {
        try {
          const storedGroups = JSON.parse(storedGroupsString) as AthkarGroup[];
          const currentGroup = storedGroups.find(g => g.id === groupId);
          if (currentGroup) {
            setGroup({ ...currentGroup, athkar: currentGroup.athkar || [] });
          } else {
            setGroup(null);
            // Toast handled by UI if group is null
          }
        } catch (e) {
          console.error("Failed to parse groups from localStorage:", e);
          setGroup(null);
          toast({ title: "خطأ", description: "فشل تحميل بيانات المجموعة.", variant: "destructive" });
        }
      } else {
        setGroup(null);
      }
    }
    setIsLoading(false);
  }, [groupId, toast]);

  useEffect(() => {
    if(isClient){
        loadGroup();
    }
  }, [loadGroup, isClient]);


  const handleAddAthkar = useCallback(() => {
    if (!newAthkarArabic.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال نص الذكر.", variant: "destructive" });
      return;
    }
    const count = parseInt(newAthkarCount, 10);
    const readingTime = parseInt(newAthkarReadingTime, 10);

    if (newAthkarCount.trim() && (isNaN(count) || count < 0)) {
      toast({ title: "خطأ", description: "عدد التكرار يجب أن يكون رقمًا صحيحًا موجبًا.", variant: "destructive" });
      return;
    }
    if (newAthkarReadingTime.trim() && (isNaN(readingTime) || readingTime < 0)) {
      toast({ title: "خطأ", description: "زمن القراءة يجب أن يكون رقمًا صحيحًا موجبًا.", variant: "destructive" });
      return;
    }

    const newAthkarItem: Athkar = {
      id: Date.now().toString(),
      arabic: newAthkarArabic.trim(),
      virtue: newAthkarVirtue.trim() || undefined,
      count: newAthkarCount.trim() ? count : undefined,
      readingTimeSeconds: newAthkarReadingTime.trim() ? readingTime : undefined,
      completed: false,
      completedCount: 0,
    };

    setGroup(prevGroup => {
      if (!prevGroup) return null;
      const updatedAthkar = [...prevGroup.athkar, newAthkarItem];
      const updatedGroup = { ...prevGroup, athkar: updatedAthkar };
      saveCurrentGroupRef.current(updatedGroup);
      return updatedGroup;
    });

    setNewAthkarArabic('');
    setNewAthkarVirtue('');
    setNewAthkarCount('');
    setNewAthkarReadingTime('');
    setIsAddAthkarDialogOpen(false);
    toast({ title: "تم بنجاح", description: "تمت إضافة الذكر إلى المجموعة." });
  }, [newAthkarArabic, newAthkarCount, newAthkarReadingTime, newAthkarVirtue, toast]);

  const openEditAthkarDialog = useCallback((athkarToEdit: Athkar) => {
    setEditingAthkar(athkarToEdit);
    setEditedAthkarArabic(athkarToEdit.arabic);
    setEditedAthkarVirtue(athkarToEdit.virtue || '');
    setEditedAthkarCount(athkarToEdit.count?.toString() || '');
    setEditedAthkarReadingTime(athkarToEdit.readingTimeSeconds?.toString() || '');
    setIsEditAthkarDialogOpen(true);
  }, []);

  const handleEditAthkar = useCallback(() => {
    if (!editingAthkar || !editedAthkarArabic.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال نص الذكر.", variant: "destructive" });
      return;
    }
    const count = parseInt(editedAthkarCount, 10);
    const readingTime = parseInt(editedAthkarReadingTime, 10);

    if (editedAthkarCount.trim() && (isNaN(count) || count < 0)) {
       toast({ title: "خطأ", description: "عدد التكرار يجب أن يكون رقمًا صحيحًا موجبًا.", variant: "destructive" });
      return;
    }
    if (editedAthkarReadingTime.trim() && (isNaN(readingTime) || readingTime < 0)) {
       toast({ title: "خطأ", description: "زمن القراءة يجب أن يكون رقمًا صحيحًا موجبًا.", variant: "destructive" });
      return;
    }

    setGroup(prevGroup => {
      if (!prevGroup || !editingAthkar) return prevGroup;
      const updatedAthkarList = prevGroup.athkar.map(a => 
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
      const updatedGroup = { ...prevGroup, athkar: updatedAthkarList };
      saveCurrentGroupRef.current(updatedGroup);
      return updatedGroup;
    });
    
    setIsEditAthkarDialogOpen(false);
    setEditingAthkar(null);
    toast({ title: "تم التعديل", description: "تم تعديل الذكر بنجاح." });
  }, [editingAthkar, editedAthkarArabic, editedAthkarCount, editedAthkarReadingTime, editedAthkarVirtue, toast]);
  
  const openDeleteAthkarDialog = useCallback((athkarToDelete: Athkar) => {
    setDeletingAthkar(athkarToDelete);
  }, []);

  const handleDeleteAthkar = useCallback(() => {
    if (!deletingAthkar) return;
     setGroup(prevGroup => {
        if (!prevGroup || !deletingAthkar) return prevGroup;
        const updatedAthkarList = prevGroup.athkar.filter(a => a.id !== deletingAthkar.id);
        const updatedGroup = { ...prevGroup, athkar: updatedAthkarList };
        saveCurrentGroupRef.current(updatedGroup);
        return updatedGroup;
     });
    setDeletingAthkar(null);
    toast({ title: "تم الحذف", description: "تم حذف الذكر من المجموعة.", variant: "destructive" });
  }, [deletingAthkar, toast]);

  const updateAthkarInGroup = useCallback((athkarId: string, updateFn: (athkar: Athkar) => Athkar) => {
    setGroup(prevGroup => {
      if (!prevGroup) return null;
      const updatedAthkarList = prevGroup.athkar.map(a => a.id === athkarId ? updateFn(a) : a);
      const updatedGroup = { ...prevGroup, athkar: updatedAthkarList };
      saveCurrentGroupRef.current(updatedGroup); // Save changes to localStorage
      return updatedGroup;
    });
  }, []);

  const handleToggleComplete = useCallback((athkarId: string) => {
    updateAthkarInGroup(athkarId, a => ({ ...a, completed: !a.completed, completedCount: !a.completed ? (a.completedCount ?? 0) + (a.count ?? 1) : a.completedCount }));
  }, [updateAthkarInGroup]);

  const handleIncrementCount = useCallback((athkarId: string) => {
    updateAthkarInGroup(athkarId, a => {
      const newCount = (a.completedCount ?? 0) + 1;
      const isNowCompleted = a.count ? newCount >= a.count : false;
      return { ...a, completedCount: newCount, completed: isNowCompleted };
    });
  }, [updateAthkarInGroup]);

  const handleDecrementCount = useCallback((athkarId: string) => {
    updateAthkarInGroup(athkarId, a => {
      const newCount = Math.max(0, (a.completedCount ?? 0) - 1);
      const isNowCompleted = a.count ? newCount >= a.count : false;
      return { ...a, completedCount: newCount, completed: isNowCompleted };
    });
  }, [updateAthkarInGroup]);
  
  const handleResetCount = useCallback((athkarId: string) => {
    updateAthkarInGroup(athkarId, a => ({ ...a, completedCount: 0, completed: false }));
  }, [updateAthkarInGroup]);


  const onDragEndAthkar = useCallback((result: DropResult) => {
    if (!result.destination) return;
     setGroup(prevGroup => {
      if (!prevGroup || !result.destination) return prevGroup;
      if (result.destination.index === result.source.index) return prevGroup;

      const reorderedAthkar = Array.from(prevGroup.athkar);
      const [movedAthkar] = reorderedAthkar.splice(result.source.index, 1);
      reorderedAthkar.splice(result.destination.index, 0, movedAthkar);
      
      const updatedGroup = { ...prevGroup, athkar: reorderedAthkar };
      saveCurrentGroupRef.current(updatedGroup);
      return updatedGroup;
    });
  }, []);

  const handleIncrementFontSize = useCallback(() => {
    setFontSizeMultiplier(prev => Math.min(prev + 0.1, 2));
  }, []);

  const handleDecrementFontSize = useCallback(() => {
    setFontSizeMultiplier(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleResetAllAthkar = useCallback(() => {
    setGroup(prevGroup => {
      if (!prevGroup) return null;
      
      const updatedAthkarList = prevGroup.athkar.map(a => ({
        ...a,
        completed: false, // Make all athkar visible
        // completedCount remains unchanged to preserve log integrity
      }));

      const updatedGroup = { ...prevGroup, athkar: updatedAthkarList };
      saveCurrentGroupRef.current(updatedGroup); 
      
      return updatedGroup;
    });
    toast({ 
        title: "تمت إعادة التعيين", 
        description: "تم إظهار جميع الأذكار لهذه الجلسة. سجل التقدم الكلي لم يتأثر." 
    });
  }, [toast]);


  const toggleSortMode = useCallback(() => {
    setIsSortMode(prev => !prev);
  }, []);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev);
  }, []);

  const toggleHaptics = useCallback(() => {
    setIsHapticsEnabled(prev => !prev);
  }, []);


  if (isLoading || !isClient) {
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
              variant="outline" 
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
              aria-label="إعادة تعيين كل الأذكار لهذه الجلسة"
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
                onResetCount={handleResetCount}
                onEditAthkar={openEditAthkarDialog}
                onDeleteAthkar={openDeleteAthkarDialog}
                fontSizeMultiplier={fontSizeMultiplier}
                isSortMode={isSortMode}
            />
          </main>
        </DragDropContext>
      )}


      {/* Add Athkar Dialog */}
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

      {/* Edit Athkar Dialog */}
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

      {/* Delete Athkar Alert Dialog */}
      {deletingAthkar && (
        <AlertDialog open={!!deletingAthkar} onOpenChange={(open) => { if (!open) setDeletingAthkar(null); }}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من حذف هذا الذكر؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف الذكر "{deletingAthkar.arabic.substring(0,20)}..." بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
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

    
