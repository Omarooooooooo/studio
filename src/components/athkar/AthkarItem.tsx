"use client";

import type { Athkar } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, PlusCircle, MinusCircle, Repeat } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AthkarItemProps {
  athkar: Athkar;
  onToggleComplete: (id: string) => void;
  onIncrementCount?: (id: string) => void;
  onDecrementCount?: (id: string) => void;
}

export function AthkarItem({ athkar, onToggleComplete, onIncrementCount, onDecrementCount }: AthkarItemProps) {
  const isCountable = athkar.count && athkar.count > 1;
  const isFullyCompleted = isCountable ? (athkar.completedCount ?? 0) >= athkar.count : athkar.completed;

  const handleMainAction = () => {
    if (isCountable && onIncrementCount && (athkar.completedCount ?? 0) < athkar.count) {
      onIncrementCount(athkar.id);
    } else if (!isCountable) {
      onToggleComplete(athkar.id);
    }
  };
  
  return (
    <Card className={`mb-4 shadow-md transition-all duration-300 ${isFullyCompleted ? 'bg-primary/10 border-primary/50' : 'bg-card'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold text-primary-foregroundrtl mb-1" style={{color: 'hsl(var(--primary))'}}>{athkar.text}</CardTitle>
            <p className="text-sm text-muted-foreground">{athkar.category}</p>
          </div>
          {!isCountable && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleComplete(athkar.id)}
              aria-label={athkar.completed ? "Mark as incomplete" : "Mark as complete"}
              className={`rounded-full transition-colors duration-300 ${athkar.completed ? 'text-primary hover:text-primary/80' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {athkar.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl leading-relaxed text-right font-arabic text-foreground mb-3" lang="ar" dir="rtl">
          {athkar.arabic}
        </p>
        {isCountable && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                Recited: {athkar.completedCount ?? 0} / {athkar.count}
              </p>
              {isFullyCompleted && <CheckCircle2 size={20} className="text-primary" />}
            </div>
            <Progress value={((athkar.completedCount ?? 0) / (athkar.count as number)) * 100} className="h-2 mb-3" />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDecrementCount && onDecrementCount(athkar.id)} 
                disabled={(athkar.completedCount ?? 0) === 0}
                className="flex-1"
                aria-label="Decrement count"
              >
                <MinusCircle size={16} className="mr-1 rtl:ml-1 rtl:mr-0" />
                Decrement
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleMainAction} 
                disabled={isFullyCompleted}
                className="flex-1"
                aria-label="Increment count"
              >
                <PlusCircle size={16} className="mr-1 rtl:ml-1 rtl:mr-0" />
                Increment
              </Button>
            </div>
             { isFullyCompleted && onToggleComplete && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onToggleComplete(athkar.id)} 
                className="mt-2 text-xs text-muted-foreground hover:text-primary"
                aria-label="Reset count"
              >
                <Repeat size={14} className="mr-1 rtl:ml-1 rtl:mr-0" /> Reset
              </Button>
             )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
