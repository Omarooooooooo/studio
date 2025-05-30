"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Athkar } from '@/types';
import { DAILY_ATHKAR } from '@/constants/athkar';
import { AthkarList } from '@/components/athkar/AthkarList';
import { AthkarProgress } from '@/components/athkar/AthkarProgress';
import { AthkarSuggestions } from '@/components/athkar/AthkarSuggestions';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sun } from 'lucide-react'; // Icon for app name

// Helper to get today's date string
const getTodayDateString = () => new Date().toISOString().split('T')[0];

export default function HomePage() {
  const [athkarList, setAthkarList] = useState<Athkar[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Load Athkar from localStorage or initialize
  useEffect(() => {
    const today = getTodayDateString();
    const storedAthkarString = localStorage.getItem(`athkari_data_${today}`);
    if (storedAthkarString) {
      try {
        const storedAthkar = JSON.parse(storedAthkarString) as Athkar[];
        // Ensure all Athkar from constant list are present, adding new ones if any
        const synchronizedAthkar = DAILY_ATHKAR.map(defaultThikr => {
          const found = storedAthkar.find(s => s.id === defaultThikr.id);
          return found ? {...defaultThikr, ...found} : {...defaultThikr, completed: false, completedCount: 0};
        });
        setAthkarList(synchronizedAthkar);
      } catch (e) {
        console.error("Failed to parse stored Athkar:", e);
        setAthkarList(DAILY_ATHKAR.map(a => ({...a, completed: false, completedCount: 0 })));
      }
    } else {
      // Initialize with default Athkar, ensuring completion status is reset
      setAthkarList(DAILY_ATHKAR.map(a => ({...a, completed: false, completedCount: 0 })));
    }
  }, []);

  // Save Athkar to localStorage whenever it changes
  useEffect(() => {
    if (athkarList.length > 0) {
      const today = getTodayDateString();
      localStorage.setItem(`athkari_data_${today}`, JSON.stringify(athkarList));
    }
  }, [athkarList]);

  const handleToggleComplete = useCallback((id: string) => {
    setAthkarList((prevList) =>
      prevList.map((thikr) => {
        if (thikr.id === id) {
          if (thikr.count && thikr.count > 1) { // For countable Athkar, this resets them
            return { ...thikr, completed: false, completedCount: 0 };
          }
          return { ...thikr, completed: !thikr.completed };
        }
        return thikr;
      })
    );
  }, []);
  
  const handleIncrementCount = useCallback((id: string) => {
    setAthkarList((prevList) => 
      prevList.map((thikr) => {
        if (thikr.id === id && thikr.count && (thikr.completedCount ?? 0) < thikr.count) {
          const newCompletedCount = (thikr.completedCount ?? 0) + 1;
          return { ...thikr, completedCount: newCompletedCount, completed: newCompletedCount >= thikr.count };
        }
        return thikr;
      })
    );
  }, []);

  const handleDecrementCount = useCallback((id: string) => {
    setAthkarList((prevList) =>
      prevList.map((thikr) => {
        if (thikr.id === id && thikr.count && (thikr.completedCount ?? 0) > 0) {
          const newCompletedCount = (thikr.completedCount ?? 0) - 1;
          return { ...thikr, completedCount: newCompletedCount, completed: newCompletedCount >= thikr.count };
        }
        return thikr;
      })
    );
  }, []);


  const completedCount = athkarList.filter(a => a.count ? (a.completedCount ?? 0) >= a.count : a.completed).length;
  const totalCount = athkarList.length;
  
  const categories = ["all", ...new Set(DAILY_ATHKAR.map(a => a.category))];

  const filteredAthkar = activeTab === "all" ? athkarList : athkarList.filter(a => a.category === activeTab);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background text-foreground">
      <header className="w-full max-w-3xl mb-8 text-center">
        <h1 className="text-5xl font-bold text-primary flex items-center justify-center">
          <Sun className="mr-3 rtl:ml-3 rtl:mr-0 h-12 w-12 text-accent" />
          Athkari - اذكاري
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Your daily companion for remembrance and reflection.
        </p>
      </header>

      <main className="w-full max-w-3xl">
        <AthkarProgress completedCount={completedCount} totalCount={totalCount} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <TabsList className="inline-flex h-auto p-1">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {category === "all" ? "All Athkar" : category}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
          
          {categories.map(category => (
            <TabsContent key={category} value={category} className="mt-4">
               <AthkarList 
                  athkarList={filteredAthkar} 
                  onToggleComplete={handleToggleComplete}
                  onIncrementCount={handleIncrementCount}
                  onDecrementCount={handleDecrementCount}
                />
            </TabsContent>
          ))}
        </Tabs>

        <AthkarSuggestions allAthkar={athkarList} />
      </main>

      <footer className="w-full max-w-3xl mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Athkari App. Cherish every moment of remembrance.
        </p>
      </footer>
    </div>
  );
}
