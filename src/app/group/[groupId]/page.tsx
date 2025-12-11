
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
import { ArrowRight, Plus, Loader2, RefreshCcw, Minus, ListFilter, Sun, Moon } from 'lucide-react';
import { AthkarList } from '@/components/athkar/AthkarList';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useAthkarStore } from '@/store/athkarStore';

export interface AthkarInSession extends Athkar { 
  sessionProgress: number;
  isSessionHidden: boolean;
}

export default function GroupPage() {
  const router = useRouter();
  const params = useParams() as { groupId?: string };
  const groupId = params.groupId;
  
  const {
    getGroupById,
    addAthkarToGroup,
    editAthkarInGroup,
    deleteAthkarFromGroup,
    reorderAthkarInGroup,
    updateAthkarLog,
    theme,
    toggleTheme,
    isHydrated,
  } = useAthkarStore();

  const group = groupId ? getGroupById(groupId) : null;
  
  const [athkarInSession, setAthkarInSession] = useState<AthkarInSession[]>([]);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  const [isSortMode, setIsSortMode] = useState(false);

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
    if (group) {
        const sessionAthkar = group.athkar.map(thikr => ({
          ...thikr,
          sessionProgress: 0,
          isSessionHidden: false,
        }));
        setAthkarInSession(sessionAthkar);
    }
  }, [group]);


  useEffect(() => {
    sessionCompletedAthkarIdsRef.current.clear();
  }, [groupId]);

  
  const handleAddAthkar = useCallback((athkarData: Omit<Athkar, 'id'>) => {
    if (!athkarData.arabic.trim() || !groupId) return;

    const newAthkarItem = addAthkarToGroup(groupId, athkarData);
    if(newAthkarItem) {
        const newAthkarInSession: AthkarInSession = {
            ...newAthkarItem,
            sessionProgress: 0,
            isSessionHidden: false,
        };
        setAthkarInSession(prev => [...prev, newAthkarInSession]);
    }
  }, [groupId, addAthkarToGroup]);


  const handleAddNewAthkarDialog = useCallback(() => {
    if (!newAthkarArabic.trim()) return;

    const count = parseInt(newAthkarCount, 10);
    const readingTime = parseInt(newAthkarReadingTime, 10);

    if (newAthkarCount.trim() && (isNaN(count) || count < 0)) return;
    if (newAthkarReadingTime.trim() && (isNaN(readingTime) || readingTime < 0)) return;
    
    handleAddAthkar({
        arabic: newAthkarArabic.trim(),
        virtue: newAthkarVirtue.trim() || undefined,
        count: newAthkarCount.trim() ? count : undefined,
        readingTimeSeconds: newAthkarReadingTime.trim() ? readingTime : undefined,
    });

    setNewAthkarArabic('');
    setNewAthkarVirtue('');
    setNewAthkarCount('');
    setNewAthkarReadingTime('');
    setIsAddAthkarDialogOpen(false);
  }, [newAthkarArabic, newAthkarCount, newAthkarReadingTime, newAthkarVirtue, handleAddAthkar]);

  const openEditAthkarDialog = useCallback((athkarToEdit: AthkarInSession) => {
    setEditingAthkar(athkarToEdit);
    setEditedAthkarArabic(athkarToEdit.arabic);
    setEditedAthkarVirtue(athkarToEdit.virtue || '');
    setEditedAthkarCount(athkarToEdit.count?.toString() || '');
    setEditedAthkarReadingTime(athkarToEdit.readingTimeSeconds?.toString() || '');
    setIsEditAthkarDialogOpen(true);
  }, []);

  const handleEditAthkar = useCallback(() => {
    if (!editingAthkar || !editedAthkarArabic.trim() || !groupId) return;

    const count = parseInt(editedAthkarCount, 10);
    const readingTime = parseInt(editedAthkarReadingTime, 10);

    if (editedAthkarCount.trim() && (isNaN(count) || count < 0)) return;
    if (editedAthkarReadingTime.trim() && (isNaN(readingTime) || readingTime < 0)) return;

    const updatedAthkarData: Partial<Athkar> = {
        arabic: editedAthkarArabic.trim(),
        virtue: editedAthkarVirtue.trim() || undefined,
        count: editedAthkarCount.trim() ? count : undefined,
        readingTimeSeconds: editedAthkarReadingTime.trim() ? readingTime : undefined,
    };

    editAthkarInGroup(groupId, editingAthkar.id, updatedAthkarData);

    setAthkarInSession(prev => prev.map(a => 
      a.id === editingAthkar.id ? { ...a, ...updatedAthkarData } : a
    ));

    setIsEditAthkarDialogOpen(false);
    setEditingAthkar(null);
  }, [editingAthkar, editedAthkarArabic, editedAthkarCount, editedAthkarReadingTime, editedAthkarVirtue, groupId, editAthkarInGroup]);

  const openDeleteAthkarDialog = useCallback((athkarToDelete: AthkarInSession) => {
    setDeletingAthkar(athkarToDelete);
  }, []);

  const handleDeleteAthkar = useCallback(() => {
    if (!deletingAthkar || !groupId) return;
    deleteAthkarFromGroup(groupId, deletingAthkar.id);
    setAthkarInSession(prev => prev.filter(a => a.id !== deletingAthkar.id));
    setDeletingAthkar(null);
  }, [deletingAthkar, groupId, deleteAthkarFromGroup]);


 const handleIncrementCount = useCallback((athkarId: string) => {
    setAthkarInSession(prev => {
        const athkarIndex = prev.findIndex(a => a.id === athkarId);
        if (athkarIndex === -1) return prev;

        const currentThikr = prev[athkarIndex];
        const targetCount = currentThikr.count || 1;
        const wasSessionHiddenPriorToThisUpdate = currentThikr.isSessionHidden;
        
        let newSessionProgress = currentThikr.sessionProgress;
        let newIsSessionHidden = currentThikr.isSessionHidden;

        if (!wasSessionHiddenPriorToThisUpdate) {
            newSessionProgress = Math.min(currentThikr.sessionProgress + 1, targetCount);

            if (newSessionProgress >= targetCount) {
                newIsSessionHidden = true; 
                if (!sessionCompletedAthkarIdsRef.current.has(athkarId)) {
                    updateAthkarLog(currentThikr.arabic, targetCount);
                    sessionCompletedAthkarIdsRef.current.add(athkarId);
                }
            }
        }
        
        const updatedAthkar = {
            ...currentThikr,
            sessionProgress: newSessionProgress,
            isSessionHidden: newIsSessionHidden,
        };

        const updatedAthkarList = [...prev];
        updatedAthkarList[athkarIndex] = updatedAthkar;
        
        return updatedAthkarList;
    });
  }, [updateAthkarLog]);


  const handleDecrementCount = useCallback((athkarId: string) => {
    setAthkarInSession(prev => {
      const updatedAthkarList = prev.map(a => {
        if (a.id === athkarId) {
          const newSessionProgress = Math.max(0, a.sessionProgress - 1);
          const targetCount = a.count || 1;
          let newIsSessionHiddenForUI = a.isSessionHidden;

          if (a.isSessionHidden && newSessionProgress < targetCount) {
            newIsSessionHiddenForUI = false; 
            if (sessionCompletedAthkarIdsRef.current.has(athkarId)) {
              updateAthkarLog(a.arabic, -targetCount); // Decrement log
              sessionCompletedAthkarIdsRef.current.delete(athkarId);
            }
          }
          return { ...a, sessionProgress: newSessionProgress, isSessionHidden: newIsSessionHiddenForUI };
        }
        return a;
      });
      return updatedAthkarList;
    });
  }, [updateAthkarLog]);

  const handleToggleComplete = useCallback((athkarId: string) => {
    setAthkarInSession(prev => {
      const athkarIndex = prev.findIndex(a => a.id === athkarId);
      if (athkarIndex === -1) return prev;

      const currentThikr = prev[athkarIndex];
      if (currentThikr.count && currentThikr.count > 1) return prev; 

      const wasSessionHiddenPriorToThisToggle = currentThikr.isSessionHidden;
      const newIsSessionHiddenForUI = !wasSessionHiddenPriorToThisToggle;

      if (newIsSessionHiddenForUI && !wasSessionHiddenPriorToThisToggle) {
        if (!sessionCompletedAthkarIdsRef.current.has(athkarId)) {
          updateAthkarLog(currentThikr.arabic, 1); 
          sessionCompletedAthkarIdsRef.current.add(athkarId);
        }
      }
      else if (!newIsSessionHiddenForUI && wasSessionHiddenPriorToThisToggle) {
        if (sessionCompletedAthkarIdsRef.current.has(athkarId)) {
          updateAthkarLog(currentThikr.arabic, -1);
          sessionCompletedAthkarIdsRef.current.delete(athkarId);
        }
      }

      const updatedAthkar = {
        ...currentThikr,
        isSessionHidden: newIsSessionHiddenForUI,
        sessionProgress: newIsSessionHiddenForUI ? (currentThikr.count || 1) : 0
      };
      const updatedAthkarList = [...prev];
      updatedAthkarList[athkarIndex] = updatedAthkar;

      return updatedAthkarList;
    });
  }, [updateAthkarLog]);

  const handleResetAllAthkar = useCallback(() => {
    // Reverse log updates for completed athkar in the current session
    sessionCompletedAthkarIdsRef.current.forEach(athkarId => {
      // Find the original athkar data from the group to get arabic text and count
      const thikr = group?.athkar.find(a => a.id === athkarId);
      if (thikr) {
        updateAthkarLog(thikr.arabic, -(thikr.count || 1));
      }
    });
    sessionCompletedAthkarIdsRef.current.clear();

    // Reset the session state for the UI
    setAthkarInSession(prev =>
      prev.map(a => ({
        ...a,
        sessionProgress: 0,
        isSessionHidden: false,
      }))
    );
  }, [group, updateAthkarLog]);

  const onDragEndAthkar = useCallback((result: DropResult) => {
    if (!result.destination || !groupId) return;
    if (result.destination.index === result.source.index) return;
    
    reorderAthkarInGroup(groupId, result.source.index, result.destination.index);
    
    setAthkarInSession(prev => {
        const reordered = Array.from(prev);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination!.index, 0, moved);
        return reordered;
    });

  }, [groupId, reorderAthkarInGroup]);

  const handleIncrementFontSize = useCallback(() => {
    setFontSizeMultiplier(prev => Math.min(prev + 0.1, 2));
  }, []);

  const handleDecrementFontSize = useCallback(() => {
    setFontSizeMultiplier(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const toggleSortMode = useCallback(() => {
    setIsSortMode(prev => !prev);
  }, []);


  if (!isHydrated) {
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
      <div className="p-4 md:p-8 animate-slide-in-from-right flex-grow flex flex-col items-center">
        <header className="w-full max-w-4xl mb-4 flex justify-between items-center">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button onClick={() => router.push('/')} variant="outline" size="icon" aria-label="العودة للرئيسية">
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="icon"
              aria-label={theme === 'light' ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
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
          </div>
        </header>

        <div className="w-full max-w-4xl text-center my-3 sm:my-4"> 
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary truncate px-2" title={group.name}>
            {group.name}
          </h1>
        </div>

        <DragDropContext onDragEnd={onDragEndAthkar}>
          <main className="w-full max-w-2xl flex-grow">
            <AthkarList
              athkarList={athkarInSession}
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
                    <Label htmlFor="edit-athkar-count">عدد التكرار (اختياري)</Label>                    <Input
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

      <div className="fixed bottom-8 right-8 z-50">
        <Dialog open={isAddAthkarDialogOpen} onOpenChange={setIsAddAthkarDialogOpen}>
            <DialogTrigger asChild>
            <Button
                className="h-16 w-16 rounded-full shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground"
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
                <Button onClick={handleAddNewAthkarDialog}>حفظ الذكر</Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

    </div>
  );
}
