
"use client";

import type { Athkar } from '@/types';
import { AthkarItem } from './AthkarItem';

interface AthkarListProps {
  athkarList: Athkar[];
  onToggleComplete: (id: string) => void;
  onIncrementCount: (id: string) => void;
  onDecrementCount: (id: string) => void;
  onResetCount: (id: string) => void;
}

export function AthkarList({ 
  athkarList, 
  onToggleComplete, 
  onIncrementCount, 
  onDecrementCount,
  onResetCount
}: AthkarListProps) {
  if (!athkarList || athkarList.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-card">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-muted-foreground mb-4"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        <h2 className="text-xl font-semibold text-foreground mb-2">لا توجد أذكار في هذه المجموعة بعد</h2>
        <p className="text-muted-foreground">
          استخدم الزر العائم (+) في أسفل الشاشة لإضافة أول ذكر لهذه المجموعة.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {athkarList.map((thikr) => (
        <AthkarItem
          key={thikr.id}
          athkar={thikr}
          onToggleComplete={onToggleComplete}
          onIncrementCount={onIncrementCount}
          onDecrementCount={onDecrementCount}
          onResetCount={onResetCount}
        />
      ))}
    </div>
  );
}
