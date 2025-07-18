
"use client";

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, MinusCircle, Info, Edit3, Trash2, Play, Pause, ChevronUp, GripVertical } from 'lucide-react';
import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { AthkarInSession } from '@/app/group/[groupId]/page';

export interface AthkarItemProps {
  athkar: AthkarInSession;
  onToggleComplete: (id: string) => void;
  onIncrementCount: (id: string) => void;
  onDecrementCount: (id: string) => void;
  onEditAthkar: () => void;
  onDeleteAthkar: () => void;
  fontSizeMultiplier: number;
  isSortMode: boolean;
  isDragging: boolean;
}

export const AthkarItem = memo(function AthkarItemComponent({
  athkar,
  onToggleComplete,
  onIncrementCount,
  onDecrementCount,
  onEditAthkar,
  onDeleteAthkar,
  fontSizeMultiplier,
  isSortMode,
  isDragging,
}: AthkarItemProps) {
  const isCountable = typeof athkar.count === 'number' && athkar.count > 1;
  const currentSessionProgress = athkar.sessionProgress || 0;

  const [isAutoCounting, setIsAutoCounting] = useState(false);
  const autoCountIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stableOnIncrementCountRef = useRef(onIncrementCount);
  useEffect(() => {
    stableOnIncrementCountRef.current = onIncrementCount;
  }, [onIncrementCount]);

  const [showVirtue, setShowVirtue] = useState(false);
  
  useEffect(() => {
    if (isAutoCounting && !athkar.isSessionHidden && isCountable && athkar.readingTimeSeconds && athkar.readingTimeSeconds > 0) {
      autoCountIntervalRef.current = setInterval(() => {
        stableOnIncrementCountRef.current(athkar.id);
      }, athkar.readingTimeSeconds * 1000);
    } else {
      if (autoCountIntervalRef.current) {
        clearInterval(autoCountIntervalRef.current);
        autoCountIntervalRef.current = null;
      }
      if (isAutoCounting && (athkar.isSessionHidden || !isCountable || !athkar.readingTimeSeconds || athkar.readingTimeSeconds <= 0)) {
        setIsAutoCounting(false);
      }
    }
    return () => {
      if (autoCountIntervalRef.current) {
        clearInterval(autoCountIntervalRef.current);
      }
    };
  }, [isAutoCounting, athkar.isSessionHidden, isCountable, athkar.id, athkar.readingTimeSeconds]);

  const stopPropagationHandler = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  const handleMainAction = useCallback((e: React.MouseEvent<HTMLElement>) => {
    stopPropagationHandler(e);
    if (isCountable) {
      if (!athkar.isSessionHidden) {
        onIncrementCount(athkar.id);
      }
    } else {
      onToggleComplete(athkar.id);
    }
  }, [isCountable, athkar.isSessionHidden, athkar.id, onIncrementCount, onToggleComplete]);


  const handleToggleAutoCount = useCallback((e: React.MouseEvent<HTMLElement>) => {
    stopPropagationHandler(e);
    if (isCountable && athkar.readingTimeSeconds && athkar.readingTimeSeconds > 0) {
      if (isAutoCounting) {
        setIsAutoCounting(false);
      } else if (!athkar.isSessionHidden) {
        setIsAutoCounting(true);
      }
    }
  }, [isCountable, athkar.readingTimeSeconds, isAutoCounting, athkar.isSessionHidden]);
  
  const circumference = 2 * Math.PI * 15.9155;
  const targetCountForProgress = athkar.count || 1;
  const progressPercentage = (currentSessionProgress / targetCountForProgress);

  const baseFontSizeRem = 1.5;
  const baseLineHeight = 1.625;

  if (isSortMode) {
    return (
      <div
        className={cn(
          "w-full flex items-center p-2 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200 ease-out cursor-grab",
          athkar.isSessionHidden ? 'opacity-60' : '',
          isDragging && '!transition-none'
        )}
      >
        <p
          className="flex-grow text-right font-arabic text-foreground truncate px-2"
          lang="ar"
          dir="rtl"
          style={{
            fontSize: `${baseFontSizeRem * fontSizeMultiplier * 0.8}rem`,
            lineHeight: '1.5'
          }}
          title={athkar.arabic}
        >
          {athkar.arabic}
        </p>
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        "w-full shadow-sm hover:shadow-md transition-shadow duration-200 ease-out bg-card cursor-grab",
        isDragging && '!transition-none'
      )}
    >
      <CardHeader className="pb-3 pt-3">
        <div className="flex justify-end items-start">
          <div className="flex items-center gap-1">
            {athkar.virtue && (
              <Button variant="ghost" size="icon" onClick={(e) => { stopPropagationHandler(e); setShowVirtue(!showVirtue);}} className="text-muted-foreground hover:text-accent-foreground h-8 w-8">
                {showVirtue ? <ChevronUp size={18} /> : <Info size={18} />}
                <span className="sr-only">{showVirtue ? 'إخفاء فضل الذكر' : 'عرض فضل الذكر'}</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={(e) => { stopPropagationHandler(e); onEditAthkar(); }} className="text-muted-foreground hover:text-blue-500 h-8 w-8">
              <Edit3 size={18} />
              <span className="sr-only">تعديل الذكر</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { stopPropagationHandler(e); onDeleteAthkar(); }} className="text-muted-foreground hover:text-red-500 h-8 w-8">
              <Trash2 size={18} />
              <span className="sr-only">حذف الذكر</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p
          className="text-center font-arabic text-foreground mb-4"
          lang="ar"
          dir="rtl"
          style={{
            fontSize: `${baseFontSizeRem * fontSizeMultiplier}rem`,
            lineHeight: `${baseLineHeight}`
          }}
        >
          {athkar.arabic}
        </p>

        {showVirtue && athkar.virtue && (
          <div className="mb-4 p-3 bg-accent/10 rounded-md border border-accent/30">
            <p
              className="text-accent-foreground/90 text-center"
              dir="rtl"
              style={{ fontSize: `${Math.max(0.75, 0.875 * fontSizeMultiplier)}rem` }}
            >
              {athkar.virtue}
            </p>
          </div>
        )}

        {isCountable ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 sm:gap-4 my-4">
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => { stopPropagationHandler(e); onDecrementCount(athkar.id);}}
                disabled={currentSessionProgress === 0 || isAutoCounting || athkar.isSessionHidden}
                aria-label="إنقاص العد"
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
              >
                <MinusCircle size={20} />
              </Button>

              <button
                onClick={handleMainAction}
                disabled={athkar.isSessionHidden || isAutoCounting} 
                aria-label={athkar.isSessionHidden ? "مكتمل لهذه الجلسة" : "زيادة العد"}
                className={`relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                            ${athkar.isSessionHidden || isAutoCounting ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80'}`}
              >
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
                  <circle
                    className="text-border"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="transparent"
                    r="15.9155"
                    cx="18"
                    cy="18"
                  />
                  <circle
                    className={cn("transition-all duration-300 ease-linear", athkar.isSessionHidden || isAutoCounting ? "text-muted-foreground" : "text-accent")}
                    strokeWidth="3"
                    strokeDasharray={`${progressPercentage * circumference}, ${circumference}`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="15.9155"
                    cx="18"
                    cy="18"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
                <span className={`relative z-10 text-xl sm:text-2xl font-semibold ${athkar.isSessionHidden || isAutoCounting ? 'text-muted-foreground' : 'text-primary-foreground'}`}>
                  {currentSessionProgress}
                </span>
              </button>

              {athkar.readingTimeSeconds && athkar.readingTimeSeconds > 0 ? (
                <Button
                  variant={isAutoCounting ? "destructive" : "outline"}
                  size="icon"
                  onClick={handleToggleAutoCount}
                  disabled={athkar.isSessionHidden || (!isAutoCounting && (!athkar.readingTimeSeconds || athkar.readingTimeSeconds <= 0))}
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                  aria-label={isAutoCounting ? "إيقاف التعداد التلقائي" : "بدء التعداد التلقائي"}
                >
                  {isAutoCounting ? <Pause size={20} /> : <Play size={20} />}
                </Button>
              ) : (
                 <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"></div> 
              )}
            </div>
          </div>
        ) : (
          <Button
            variant={athkar.isSessionHidden ? "secondary" : "default"}
            onClick={handleMainAction}
            className="w-full"
            aria-label={athkar.isSessionHidden ? "تمييز كغير مكتمل لهذه الجلسة" : "تمييز كمكتمل لهذه الجلسة"}
          >
            {athkar.isSessionHidden ? (
              <CheckCircle2 size={20} className="mr-2 rtl:ml-2 rtl:mr-0 text-green-500" />
            ) : (
              <Circle size={20} className="mr-2 rtl:ml-2 rtl:mr-0" />
            )}
            {athkar.isSessionHidden ? 'مكتمل (لهذه الجلسة)' : 'إكمال الذكر'}
          </Button>
        )}
      </CardContent>
      {((athkar.count && athkar.count > 0) || athkar.readingTimeSeconds) && (
         <CardFooter className="text-xs text-muted-foreground pt-2 pb-3 flex justify-between rtl:space-x-reverse ltr:space-x-2">
            {athkar.count && athkar.count > 0 && (
              <p className="rtl:text-right ltr:text-left">التكرار المطلوب: {athkar.count}</p>
            )}
            {!(athkar.count && athkar.count > 0) && athkar.readingTimeSeconds && <span />} 
            {athkar.readingTimeSeconds && (
                <p className="ltr:text-right rtl:text-left">زمن القراءة المقدر: {athkar.readingTimeSeconds} ثانية</p>
            )}
         </CardFooter>
        )}
    </Card>
  );
});
AthkarItem.displayName = 'AthkarItem';
