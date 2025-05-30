
"use client";

import type { StoredAthkar } from '@/types'; 
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, MinusCircle, Info, Edit3, Trash2, Play, Pause, GripVertical, ChevronUp } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

interface AthkarInSession extends StoredAthkar {
  sessionProgress: number;
  isSessionHidden: boolean;
}

interface AthkarItemProps {
  athkar: AthkarInSession; 
  onToggleComplete: (id: string) => void; 
  onIncrementCount: (id: string) => void; 
  onDecrementCount: (id: string) => void; 
  onEdit: () => void;
  onDelete: () => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null | undefined;
  fontSizeMultiplier: number;
  isSortMode: boolean;
}

export function AthkarItem({
  athkar,
  onToggleComplete,
  onIncrementCount,
  onDecrementCount,
  onEdit,
  onDelete,
  dragHandleProps,
  fontSizeMultiplier,
  isSortMode
}: AthkarItemProps) {
  const isCountable = typeof athkar.count === 'number' && athkar.count > 1; 
  const currentSessionProgress = athkar.sessionProgress || 0;
  const isSessionHidden = athkar.isSessionHidden;

  const [isAutoCounting, setIsAutoCounting] = useState(false);
  const autoCountIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stableOnIncrementCountRef = useRef(onIncrementCount);

  const [showVirtue, setShowVirtue] = useState(false);

  useEffect(() => {
    stableOnIncrementCountRef.current = onIncrementCount;
  }, [onIncrementCount]);

  useEffect(() => {
    if (isAutoCounting && !isSessionHidden && isCountable && athkar.readingTimeSeconds && athkar.readingTimeSeconds > 0) {
      autoCountIntervalRef.current = setInterval(() => {
        if (stableOnIncrementCountRef.current && !athkar.isSessionHidden) { 
             stableOnIncrementCountRef.current(athkar.id);
        } else if (athkar.isSessionHidden) { 
            setIsAutoCounting(false);
        }
      }, athkar.readingTimeSeconds * 1000);
    } else {
      if (autoCountIntervalRef.current) {
        clearInterval(autoCountIntervalRef.current);
        autoCountIntervalRef.current = null;
      }
      if (isAutoCounting && (isSessionHidden || !isCountable || !athkar.readingTimeSeconds || athkar.readingTimeSeconds <= 0)) {
        setIsAutoCounting(false); 
      }
    }
    return () => {
      if (autoCountIntervalRef.current) {
        clearInterval(autoCountIntervalRef.current);
      }
    };
  }, [isAutoCounting, isSessionHidden, isCountable, athkar.id, athkar.readingTimeSeconds]);


  const handleMainAction = useCallback(() => {
    if (isCountable) {
      if (!isSessionHidden) { 
        onIncrementCount(athkar.id);
      }
    } else { 
      onToggleComplete(athkar.id);
    }
  }, [isCountable, isSessionHidden, athkar.id, onIncrementCount, onToggleComplete]);


  const handleToggleAutoCount = useCallback(() => {
    if (isCountable && athkar.readingTimeSeconds && athkar.readingTimeSeconds > 0) {
      if (isAutoCounting) {
        setIsAutoCounting(false);
      } else if (!isSessionHidden) { 
        setIsAutoCounting(true);
      }
    }
  }, [isCountable, athkar.readingTimeSeconds, isAutoCounting, isSessionHidden]);

  const circumference = 2 * Math.PI * 15.9155; 
  const targetCountForProgress = athkar.count || 1;
  const progressPercentage = (currentSessionProgress / targetCountForProgress);

  const baseFontSizeRem = 1.5; 
  const baseLineHeight = 1.625; 

  if (isSortMode) {
    return (
      <Card className={cn(
          "w-full shadow-md hover:shadow-lg transition-shadow duration-200 ease-out flex items-center p-2",
          isSessionHidden ? 'opacity-60 bg-card/80' : 'bg-card'
        )}
      >
        <div 
          {...(isSortMode ? dragHandleProps : {})} 
          className={cn(
            "p-1 text-muted-foreground", 
            isSortMode ? "cursor-grab hover:text-foreground" : "cursor-default"
          )}
          aria-label={isSortMode ? "اسحب لترتيب الذكر" : undefined}
        >
          <GripVertical size={20} />
        </div>
        <p 
          className="flex-grow text-center font-arabic text-foreground truncate px-2" 
          lang="ar" 
          dir="rtl"
          style={{ 
            fontSize: `${baseFontSizeRem * fontSizeMultiplier * 0.8}rem`, // Slightly smaller in sort mode
            lineHeight: '1.5' 
          }}
          title={athkar.arabic}
        >
          {athkar.arabic}
        </p>
         <div className="w-8 h-8"> {/* Placeholder to balance layout if needed, or for future sort-mode actions */}</div>
      </Card>
    );
  }

  return (
    <Card className={cn(
        "w-full shadow-lg hover:shadow-xl transition-shadow duration-200 ease-out",
        isSessionHidden && !isSortMode ? 'hidden' : 'bg-card',
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div 
            {...(isSortMode ? dragHandleProps : {})} 
            className={cn(
              "p-1 text-muted-foreground", 
              isSortMode ? "cursor-grab hover:text-foreground" : "cursor-default"
            )}
            aria-label={isSortMode ? "اسحب لترتيب الذكر" : undefined}
          >
            <GripVertical size={20} />
          </div>
          <div className="flex items-center gap-1">
            {athkar.virtue && (
              <Button variant="ghost" size="icon" onClick={() => setShowVirtue(!showVirtue)} className="text-muted-foreground hover:text-accent-foreground h-8 w-8">
                {showVirtue ? <ChevronUp size={18} /> : <Info size={18} />}
                <span className="sr-only">{showVirtue ? 'إخفاء فضل الذكر' : 'عرض فضل الذكر'}</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onEdit} className="text-muted-foreground hover:text-blue-500 h-8 w-8">
              <Edit3 size={18} />
              <span className="sr-only">تعديل الذكر</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-muted-foreground hover:text-red-500 h-8 w-8">
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
              style={{ fontSize: `${0.875 * fontSizeMultiplier}rem` }}
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
                onClick={() => onDecrementCount(athkar.id)}
                disabled={currentSessionProgress === 0 || isAutoCounting || isSessionHidden}
                aria-label="إنقاص العد"
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
              >
                <MinusCircle size={20} />
              </Button>

              <button
                onClick={handleMainAction} 
                disabled={isSessionHidden || isAutoCounting}
                aria-label={isSessionHidden ? "مكتمل لهذه الجلسة" : "زيادة العد"}
                className={`relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                            ${isSessionHidden || isAutoCounting ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 cursor-pointer'}`}
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
                    className={cn("transition-all duration-300 ease-linear", isSessionHidden || isAutoCounting ? "text-muted-foreground" : "text-primary")}
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
                <span className={`relative z-10 text-xl sm:text-2xl font-semibold ${isSessionHidden || isAutoCounting ? 'text-muted-foreground' : 'text-primary-foreground'}`}>
                  {currentSessionProgress}
                </span>
              </button>

              {athkar.readingTimeSeconds && athkar.readingTimeSeconds > 0 ? (
                <Button
                  variant={isAutoCounting ? "destructive" : "outline"}
                  size="icon"
                  onClick={handleToggleAutoCount}
                  disabled={isSessionHidden || (!isAutoCounting && (!athkar.readingTimeSeconds || athkar.readingTimeSeconds <= 0))}
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
            variant={isSessionHidden ? "secondary" : "default"}
            onClick={handleMainAction} 
            className="w-full"
            aria-label={isSessionHidden ? "تمييز كغير مكتمل لهذه الجلسة" : "تمييز كمكتمل لهذه الجلسة"}
          >
            {isSessionHidden ? (
              <CheckCircle2 size={20} className="mr-2 rtl:ml-2 rtl:mr-0 text-green-500" />
            ) : (
              <Circle size={20} className="mr-2 rtl:ml-2 rtl:mr-0" />
            )}
            {isSessionHidden ? 'مكتمل (لهذه الجلسة)' : 'إكمال الذكر'}
          </Button>
        )}
      </CardContent>
      {(athkar.count || athkar.readingTimeSeconds) && !isSortMode && (
         <CardFooter className="text-xs text-muted-foreground pt-2 pb-3 flex justify-between">
            {athkar.count && athkar.count > 0 && ( 
              <p className="rtl:text-right">التكرار المطلوب: {athkar.count}</p>
            )}
            {!(athkar.count && athkar.count > 0) && athkar.readingTimeSeconds && <span />} 
            {athkar.readingTimeSeconds && (
                <p className="ltr:text-right rtl:text-left">زمن القراءة المقدر: {athkar.readingTimeSeconds} ثانية</p>
            )}
         </CardFooter>
        )}
    </Card>
  );
}

    