
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { ArrowRight, ListOrdered, Loader2, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAthkarStore } from '@/store/athkarStore';

interface LogItem {
  arabic: string;
  totalCompletedRepetitions: number;
}

export default function AthkarLogPage() {
  const router = useRouter();
  const { athkarLog, isHydrated, clearAthkarLog, deleteAthkarLogEntry } = useAthkarStore();
  const [logEntries, setLogEntries] = useState<LogItem[]>([]);

  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [deletingIndividualAthkar, setDeletingIndividualAthkar] = useState<LogItem | null>(null);

  useEffect(() => {
    if (isHydrated) {
      const entries: LogItem[] = Object.entries(athkarLog)
        .map(([arabic, totalCompletedRepetitions]) => ({
          arabic,
          totalCompletedRepetitions,
        }))
        .sort((a, b) => b.totalCompletedRepetitions - a.totalCompletedRepetitions);
      setLogEntries(entries);
    }
  }, [athkarLog, isHydrated]);
  
  const handleDeleteAllProgress = useCallback(() => {
    clearAthkarLog();
    setIsDeleteAllDialogOpen(false);
  }, [clearAthkarLog]);

  const handleDeleteIndividualProgress = useCallback(() => {
    if (deletingIndividualAthkar) {
      deleteAthkarLogEntry(deletingIndividualAthkar.arabic);
      setDeletingIndividualAthkar(null);
    }
  }, [deletingIndividualAthkar, deleteAthkarLogEntry]);


  if (!isHydrated) {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">جاري تحميل سجل الأذكار...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background text-foreground">
      <header className="w-full max-w-3xl mb-8 flex justify-between items-center">
        <Button onClick={() => router.back()} variant="outline" size="icon" aria-label="العودة للخلف">
          <ArrowRight className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-primary flex items-center">
          سجل الأذكار
        </h1>
        {logEntries.length > 0 ? (
            <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDeleteAllDialogOpen(true)}
                aria-label="حذف كل التقدم من السجل"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
                <Trash2 className="h-5 w-5" />
            </Button>
        ) : (
            <div className="w-10 h-10"></div> 
        )}
      </header>

      <main className="w-full max-w-3xl flex-grow">
        {logEntries.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-6 text-center text-muted-foreground">
              <ListOrdered className="mx-auto h-16 w-16 text-primary mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-foreground mb-2">لا يوجد تقدم مسجل بعد</h2>
              <p>
                ابدأ بقراءة الأذكار في مجموعاتك، وسيظهر إجمالي التكرارات المكتملة هنا.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-3 pr-4 rtl:pl-4 rtl:pr-0">
              {logEntries.map((entry) => (
                <Card key={entry.arabic} className="shadow-sm">
                  <CardContent className="p-4 flex justify-between items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90 h-8 w-8"
                      onClick={() => setDeletingIndividualAthkar(entry)}
                      aria-label={`حذف تقدم الذكر: ${entry.arabic.substring(0,20)}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <p className="text-md font-arabic flex-grow text-right mx-3" lang="ar" dir="rtl">
                      {entry.arabic}
                    </p>
                    <span className="text-lg font-semibold text-primary">
                      {entry.totalCompletedRepetitions}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </main>

      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف كل التقدم؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف جميع بيانات سجل الأذكار بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteAllDialogOpen(false)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllProgress}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              نعم، حذف الكل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {deletingIndividualAthkar && (
        <AlertDialog open={!!deletingIndividualAthkar} onOpenChange={() => setDeletingIndividualAthkar(null)}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من حذف تقدم هذا الذكر؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف تقدم الذكر "{deletingIndividualAthkar.arabic.substring(0, 30)}..." من السجل بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingIndividualAthkar(null)}>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteIndividualProgress}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                نعم، حذف التقدم
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
