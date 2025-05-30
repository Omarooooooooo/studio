"use client";

import type { Athkar } from '@/types';
import { AthkarItem } from './AthkarItem';

interface AthkarListProps {
  athkarList: Athkar[];
  onToggleComplete: (id: string) => void;
  onIncrementCount: (id: string) => void;
  onDecrementCount: (id: string) => void;
}

export function AthkarList({ athkarList, onToggleComplete, onIncrementCount, onDecrementCount }: AthkarListProps) {
  if (!athkarList || athkarList.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No Athkar to display for this category.</p>;
  }

  return (
    <div className="space-y-4">
      {athkarList.map((thikr) => (
        <AthkarItem 
          key={thikr.id} 
          athkar={thikr} 
          onToggleComplete={onToggleComplete}
          onIncrementCount={onIncrementCount}
          onDecrementCount={onDecrementCount}
        />
      ))}
    </div>
  );
}
