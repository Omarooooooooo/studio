
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AthkarLogStore } from '@/types';
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

const ATHKAR_LOG_STORAGE_KEY = 'athkari_separate_log_data';

interface LogItem {
  arabic: string;
  totalCompletedRepetitions: number;
}

export default function AthkarLogPage() {
  const router = useRouter();
  const [logEntries, setLogEntries] = useState<LogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [deletingIndividualAthkar, setDeletingIndividualAthkar] = useState<LogItem | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadLogData = useCallback(() => {
    if (isClient) {
      setIsLoading(true);
      try {
        const logString = localStorage.getItem(ATHKAR_LOG_STORAGE_KEY);
        if (logString) {
          const logData: AthkarLogStore = JSON.parse(logString);
          const entries: LogItem[] = Object.entries(logData)
            .map(([arabic, totalCompletedRepetitions]) => ({
              arabic,
              totalCompletedRepetitions,
            }))
            .sort((a, b) => b.totalCompletedRepetitions - a.totalCompletedRepetitions);
          setLogEntries(entries);
          console.log("ATHKAR_LOG_PAGE: Loaded and processed log data:", entries);
        } else {
          setLogEntries([]);
          console.log("ATHKAR_LOG_PAGE: No log data found in localStorage.");
        }
      } catch (error) {
        console.error("Failed to load or parse Athkar log data:", error);
        setLogEntries([]);
      }
      setIsLoading(false);
    }
  }, [isClient]);

  useEffect(() => {
    loadLogData();
  }, [loadLogData]);

  const handleDeleteAllProgress = useCallback(() => {
    if (isClient) {
      try {
        localStorage.removeItem(ATHKAR_LOG_STORAGE_KEY);
        setLogEntries([]); // Clear displayed entries
        console.log("ATHKAR_LOG_PAGE: All log data deleted.");
      } catch (error) {
        console.error("Failed to delete all Athkar log data:", error);
      }
      setIsDeleteAllDialogOpen(false);
    }
  }, [isClient]);

  const handleDeleteIndividualProgress = useCallback(() => {
    if (isClient && deletingIndividualAthkar) {
      try {
        const logString = localStorage.getItem(ATHKAR_LOG_STORAGE_KEY);
        if (logString) {
          const logData: AthkarLogStore = JSON.parse(logString);
          delete logData[deletingIndividualAthkar.arabic];
          localStorage.setItem(ATHKAR_LOG_STORAGE_KEY, JSON.stringify(logData));
          
          // Reload data to reflect change
          loadLogData();
          console.log(`ATHKAR_LOG_PAGE: Deleted log data for "${deletingIndividualAthkar.arabic}".`);
        }
      } catch (error) {
        console.error(`Failed to delete log data for "${deletingIndividualAthkar.arabic}":`, error);
      }
      setDeletingIndividualAthkar(null);
    }
  }, [isClient, deletingIndividualAthkar, loadLogData]);


  if (!isClient || isLoading) {
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
                variant="destructive"
                size="icon"
                onClick={() => setIsDeleteAllDialogOpen(true)}
                aria-label="حذف كل التقدم من السجل"
            >
                <Trash2 className="h-5 w-5" />
            </Button>
        ) : (
            <div className="w-10 h-10"></div> /* Spacer to keep layout consistent */
        )}
      </header>

      <main className="w-full max-w-2xl flex-grow">
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

      {/* AlertDialog for Deleting All Progress */}
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

      {/* AlertDialog for Deleting Individual Progress */}
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
