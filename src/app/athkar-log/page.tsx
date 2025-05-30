
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AthkarGroup, Athkar } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Loader2, ScrollText } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'athkari_groups';

interface AthkarLogEntry {
  arabic: string;
  totalCompleted: number;
}

export default function AthkarLogPage() {
  const router = useRouter();
  const [logData, setLogData] = useState<AthkarLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedGroupsString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedGroupsString) {
        try {
          const storedGroups = JSON.parse(storedGroupsString) as AthkarGroup[];
          const completionMap: Map<string, number> = new Map();

          storedGroups.forEach(group => {
            if (group.athkar && Array.isArray(group.athkar)) {
              group.athkar.forEach(thikr => {
                const currentCount = completionMap.get(thikr.arabic) || 0;
                completionMap.set(thikr.arabic, currentCount + (thikr.completedCount || 0));
              });
            }
          });

          const aggregatedLogData: AthkarLogEntry[] = [];
          completionMap.forEach((totalCompleted, arabic) => {
            if (totalCompleted > 0) { // Only include athkar that have been completed at least once
                aggregatedLogData.push({ arabic, totalCompleted });
            }
          });
          
          // Sort by most completed
          aggregatedLogData.sort((a, b) => b.totalCompleted - a.totalCompleted);

          setLogData(aggregatedLogData);
        } catch (e) {
          console.error("Failed to parse or process groups from localStorage:", e);
          setLogData([]);
        }
      }
      setIsLoading(false);
    }
  }, [isClient]);

  if (isLoading || !isClient) {
    return (
      <div dir="rtl" className="flex flex-col justify-center items-center min-h-screen bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">جاري تحميل سجل الأذكار...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background text-foreground">
      <header className="w-full max-w-3xl mb-8 flex justify-between items-center">
        <Button onClick={() => router.push('/')} variant="outline" size="icon" aria-label="العودة للرئيسية">
          <ArrowRight className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <ScrollText className="ml-3 rtl:mr-0 rtl:ml-3 h-8 w-8 text-accent" />
          سجل الأذكار
        </h1>
        <div className="w-10"></div> {/* Placeholder for spacing */}
      </header>

      <main className="w-full max-w-xl flex-grow">
        {logData.length === 0 ? (
          <Card className="text-center text-muted-foreground py-10">
            <CardContent>
              <p className="text-xl">لم تقم بإكمال أي أذكار بعد.</p>
              <p>ابدأ بإكمال الأذكار في مجموعاتك ليظهر السجل هنا.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {logData.map((entry, index) => (
              <Card key={index} className="shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                  <p className="text-md font-arabic flex-grow text-right text-foreground" lang="ar">
                    {entry.arabic}
                  </p>
                  <p className="text-lg font-semibold text-primary pr-4 rtl:pl-4 rtl:pr-0">
                    {entry.totalCompleted}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
