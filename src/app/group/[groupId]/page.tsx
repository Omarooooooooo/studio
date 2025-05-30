
"use client";

import { useEffect, useState } from 'react';
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
import { ArrowRight, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'athkari_groups';

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const [group, setGroup] = useState<AthkarGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // State for Add Athkar Dialog
  const [isAddAthkarDialogOpen, setIsAddAthkarDialogOpen] = useState(false);
  const [newAthkarArabic, setNewAthkarArabic] = useState('');
  const [newAthkarVirtue, setNewAthkarVirtue] = useState('');
  const [newAthkarCount, setNewAthkarCount] = useState('');
  const [newAthkarReadingTime, setNewAthkarReadingTime] = useState('');

  useEffect(() => {
    if (groupId) {
      const storedGroupsString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedGroupsString) {
        try {
          const storedGroups = JSON.parse(storedGroupsString) as AthkarGroup[];
          const currentGroup = storedGroups.find(g => g.id === groupId);
          if (currentGroup) {
            setGroup({ ...currentGroup, athkar: currentGroup.athkar || [] });
          } else {
            setGroup(null);
          }
        } catch (e) {
          console.error("Failed to parse groups from localStorage:", e);
          setGroup(null);
        }
      }
    }
    setIsLoading(false);
  }, [groupId]);

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

    const storedGroupsString = localStorage.getItem(LOCAL_STORAGE_KEY);
    let storedGroups: AthkarGroup[] = [];
    if (storedGroupsString) {
      try {
        storedGroups = JSON.parse(storedGroupsString);
      } catch (e) {
        console.error("Failed to parse groups from localStorage:", e);
        toast({ title: "خطأ", description: "حدث خطأ أثناء تحديث المجموعة.", variant: "destructive" });
        return;
      }
    }

    const groupIndex = storedGroups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) {
      toast({ title: "خطأ", description: "لم يتم العثور على المجموعة.", variant: "destructive" });
      return;
    }

    const updatedGroup = { ...storedGroups[groupIndex] };
    if (!updatedGroup.athkar) {
      updatedGroup.athkar = [];
    }
    updatedGroup.athkar.push(newAthkarItem);
    storedGroups[groupIndex] = updatedGroup;

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedGroups));
    setGroup(updatedGroup); // Update local state

    setNewAthkarArabic('');
    setNewAthkarVirtue('');
    setNewAthkarCount('');
    setNewAthkarReadingTime('');
    setIsAddAthkarDialogOpen(false);
    toast({ title: "تم بنجاح", description: "تمت إضافة الذكر إلى المجموعة." });
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
        <p className="text-lg">جاري تحميل المجموعة...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 bg-background text-foreground">
        <p className="text-xl text-destructive mb-6">لم يتم العثور على المجموعة.</p>
        <Button onClick={() => router.push('/')} variant="outline">
          <ArrowRight className="mr-2 rtl:ml-2 rtl:mr-0" />
          العودة إلى الرئيسية
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background text-foreground">
      <header className="w-full max-w-4xl mb-8">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => router.push('/')} variant="outline" size="sm">
            <ArrowRight className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
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
      
      <main className="w-full max-w-4xl flex-grow">
        {(!group.athkar || group.athkar.length === 0) ? (
          <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-muted-foreground mb-4"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
            <h2 className="text-xl font-semibold text-foreground mb-2">لا توجد أذكار في هذه المجموعة بعد</h2>
            <p className="text-muted-foreground mb-6">
              استخدم الزر العائم (+) في أسفل الشاشة لإضافة أول ذكر لهذه المجموعة.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Athkar list will be rendered here in the future */}
            <p className="text-center text-muted-foreground p-4 border rounded-md">
              تمت إضافة {group.athkar.length} ذكر / أذكار. (سيتم عرض القائمة هنا قريباً)
            </p>
          </div>
        )}
      </main>

      <Dialog open={isAddAthkarDialogOpen} onOpenChange={setIsAddAthkarDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-8 right-8 rtl:left-8 rtl:right-auto h-16 w-16 rounded-full shadow-lg z-50 text-2xl"
            size="icon"
            aria-label="إضافة ذكر جديد"
          >
            <Plus size={32} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة ذكر جديد إلى "{group.name}"</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل الذكر الجديد ليتم إضافته إلى هذه المجموعة.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="athkar-arabic" className="text-right rtl:text-left">نص الذكر (بالعربية)</Label>
              <Textarea
                id="athkar-arabic"
                value={newAthkarArabic}
                onChange={(e) => setNewAthkarArabic(e.target.value)}
                placeholder="سبحان الله وبحمده..."
                dir="rtl"
                lang="ar"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="athkar-virtue" className="text-right rtl:text-left">فضل الذكر (اختياري)</Label>
              <Textarea
                id="athkar-virtue"
                value={newAthkarVirtue}
                onChange={(e) => setNewAthkarVirtue(e.target.value)}
                placeholder="مثال: من قاله مائة مرة حطت خطاياه..."
                dir="rtl"
                lang="ar"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="athkar-count" className="text-right rtl:text-left">عدد التكرار (اختياري)</Label>
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
                    <Label htmlFor="athkar-reading-time" className="text-right rtl:text-left">زمن القراءة/ثانية (اختياري)</Label>
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
