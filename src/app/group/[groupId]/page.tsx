
"use client";

import { useEffect, useState, useCallback } from 'react';
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
import { ArrowRight, Plus, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { AthkarList } from '@/components/athkar/AthkarList';

const LOCAL_STORAGE_KEY = 'athkari_groups';

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const [group, setGroup] = useState<AthkarGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [isAddAthkarDialogOpen, setIsAddAthkarDialogOpen] = useState(false);
  const [newAthkarArabic, setNewAthkarArabic] = useState('');
  const [newAthkarVirtue, setNewAthkarVirtue] = useState('');
  const [newAthkarCount, setNewAthkarCount] = useState('');
  const [newAthkarReadingTime, setNewAthkarReadingTime] = useState('');

  const loadGroup = useCallback(() => {
    if (groupId) {
      const storedGroupsString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedGroupsString) {
        try {
          const storedGroups = JSON.parse(storedGroupsString) as AthkarGroup[];
          const currentGroup = storedGroups.find(g => g.id === groupId);
          if (currentGroup) {
            setGroup({ ...currentGroup, athkar: currentGroup.athkar || [] });
          } else {
            setGroup(null); // Group not found
            toast({ title: "خطأ", description: "المجموعة غير موجودة.", variant: "destructive" });
          }
        } catch (e) {
          console.error("Failed to parse groups from localStorage:", e);
          setGroup(null);
          toast({ title: "خطأ", description: "فشل تحميل بيانات المجموعة.", variant: "destructive" });
        }
      } else {
        setGroup(null); // No groups stored
      }
    }
    setIsLoading(false);
  }, [groupId, toast]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  const saveGroup = useCallback((updatedGroup: AthkarGroup | null) => {
    if (!updatedGroup) return;
    const storedGroupsString = localStorage.getItem(LOCAL_STORAGE_KEY);
    let storedGroups: AthkarGroup[] = [];
    if (storedGroupsString) {
      try {
        storedGroups = JSON.parse(storedGroupsString);
      } catch (e) {
        console.error("Failed to parse groups from localStorage during save:", e);
        return;
      }
    }
    const groupIndex = storedGroups.findIndex(g => g.id === updatedGroup.id);
    if (groupIndex !== -1) {
      storedGroups[groupIndex] = updatedGroup;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedGroups));
    }
  }, []);


  const handleAddAthkar = () => {
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

    if (group) {
      const updatedAthkar = [...group.athkar, newAthkarItem];
      const updatedGroup = { ...group, athkar: updatedAthkar };
      setGroup(updatedGroup);
      saveGroup(updatedGroup);

      setNewAthkarArabic('');
      setNewAthkarVirtue('');
      setNewAthkarCount('');
      setNewAthkarReadingTime('');
      setIsAddAthkarDialogOpen(false);
      toast({ title: "تم بنجاح", description: "تمت إضافة الذكر إلى المجموعة." });
    }
  };

  const updateAthkarInGroup = (athkarId: string, updateFn: (athkar: Athkar) => Athkar) => {
    if (group) {
      const updatedAthkarList = group.athkar.map(a => a.id === athkarId ? updateFn(a) : a);
      const updatedGroup = { ...group, athkar: updatedAthkarList };
      setGroup(updatedGroup);
      saveGroup(updatedGroup);
    }
  };

  const handleToggleComplete = (athkarId: string) => {
    updateAthkarInGroup(athkarId, a => ({ ...a, completed: !a.completed, completedCount: !a.completed ? (a.count ?? 1) : 0 }));
  };

  const handleIncrementCount = (athkarId: string) => {
    updateAthkarInGroup(athkarId, a => {
      const newCount = (a.completedCount ?? 0) + 1;
      const isCompleted = newCount >= (a.count ?? 1);
      return { ...a, completedCount: newCount, completed: isCompleted };
    });
  };

  const handleDecrementCount = (athkarId: string) => {
    updateAthkarInGroup(athkarId, a => {
      const newCount = Math.max(0, (a.completedCount ?? 0) - 1);
      return { ...a, completedCount: newCount, completed: newCount >= (a.count ?? 1) };
    });
  };
  
  const handleResetCount = (athkarId: string) => {
    updateAthkarInGroup(athkarId, a => ({ ...a, completedCount: 0, completed: false }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">جاري تحميل المجموعة...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 bg-background text-foreground">
        <p className="text-xl text-destructive mb-6">لم يتم العثور على المجموعة المطلوبة.</p>
        <Button onClick={() => router.push('/')} variant="outline">
          <ArrowRight className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
          العودة إلى الرئيسية
        </Button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background text-foreground">
      <header className="w-full max-w-4xl mb-8">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => router.push('/')} variant="outline" size="sm">
            <ArrowRight className="ml-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">
            {group.name}
          </h1>
          <p className="text-md text-muted-foreground">
            هنا يمكنك إضافة وإدارة الأذكار الخاصة بمجموعة "{group.name}".
          </p>
        </div>
      </header>

      <main className="w-full max-w-2xl flex-grow">
        <AthkarList
            athkarList={group.athkar}
            onToggleComplete={handleToggleComplete}
            onIncrementCount={handleIncrementCount}
            onDecrementCount={handleDecrementCount}
            onResetCount={handleResetCount}
        />
      </main>

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
              <Label htmlFor="athkar-arabic">نص الذكر (بالعربية)</Label>
              <Textarea
                id="athkar-arabic"
                value={newAthkarArabic}
                onChange={(e) => setNewAthkarArabic(e.target.value)}
                placeholder="سبحان الله وبحمده..."
                lang="ar"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="athkar-virtue">فضل الذكر (اختياري)</Label>
              <Textarea
                id="athkar-virtue"
                value={newAthkarVirtue}
                onChange={(e) => setNewAthkarVirtue(e.target.value)}
                placeholder="مثال: من قاله مائة مرة حطت خطاياه..."
                lang="ar"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="athkar-count">عدد التكرار (اختياري)</Label>
                    <Input
                        id="athkar-count"
                        type="number"
                        value={newAthkarCount}
                        onChange={(e) => setNewAthkarCount(e.target.value)}
                        placeholder="مثال: 3 أو 100"
                        min="0"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="athkar-reading-time">زمن القراءة/ثانية (اختياري)</Label>
                    <Input
                        id="athkar-reading-time"
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

      <footer className="w-full max-w-3xl mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Athkari App.
        </p>
      </footer>
    </div>
  );
}
