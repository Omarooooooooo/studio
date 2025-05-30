
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AthkarLogStore } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, History, ListOrdered, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
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
          <History className="ml-3 rtl:mr-0 rtl:ml-3 h-7 w-7" />
          سجل إكمال الأذكار
        </h1>
        <div className="w-10 h-10"></div> {/* Spacer */}
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
                    <p className="text-md font-arabic flex-grow text-right" lang="ar" dir="rtl">
                      {entry.arabic}
                    </p>
                    <div className="text-left flex-shrink-0 ml-4 rtl:mr-4 rtl:ml-0">
                      <span className="text-lg font-semibold text-primary">{entry.totalCompletedRepetitions}</span>
                      <p className="text-xs text-muted-foreground">مرات التكرار</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
