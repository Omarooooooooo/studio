
"use client";

import type { Athkar } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, PlusCircle, MinusCircle, Repeat, Info, Edit3, Trash2, Play, Pause, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

interface AthkarItemProps {
  athkar: Athkar;
  onToggleComplete: (id: string) => void;
  onIncrementCount: (id: string) => void;
  onDecrementCount: (id: string) => void;
  onResetCount: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null | undefined;
}

export function AthkarItem({
  athkar,
  onToggleComplete,
  onIncrementCount,
  onDecrementCount,
  onResetCount,
  onEdit,
  onDelete,
  dragHandleProps
}: AthkarItemProps) {
  const isCountable = typeof athkar.count === 'number' && athkar.count > 0;
  const currentCompletedCount = athkar.completedCount ?? 0;
  const isFullyCompleted = isCountable ? currentCompletedCount >= athkar.count : athkar.completed;

  const [isAutoCounting, setIsAutoCounting] = useState(false);
  const autoCountIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stableOnIncrementCountRef = useRef(onIncrementCount);

  const [showVirtue, setShowVirtue] = useState(false);

  useEffect(() => {
    stableOnIncrementCountRef.current = onIncrementCount;
  }, [onIncrementCount]);

  useEffect(() => {
    if (isAutoCounting && !isFullyCompleted && isCountable && athkar.readingTimeSeconds && athkar.readingTimeSeconds > 0) {
      autoCountIntervalRef.current = setInterval(() => {
        stableOnIncrementCountRef.current(athkar.id);
      }, athkar.readingTimeSeconds * 1000);
    } else {
      if (autoCountIntervalRef.current) {
        clearInterval(autoCountIntervalRef.current);
        autoCountIntervalRef.current = null;
      }
      if (isAutoCounting && (isFullyCompleted || !athkar.readingTimeSeconds || athkar.readingTimeSeconds <= 0)) {
        setIsAutoCounting(false);
      }
    }
    return () => {
      if (autoCountIntervalRef.current) {
        clearInterval(autoCountIntervalRef.current);
      }
    };
  }, [isAutoCounting, isFullyCompleted, isCountable, athkar.id, athkar.readingTimeSeconds]);


  const handleMainAction = useCallback(() => {
    if (isCountable) {
      if (currentCompletedCount < athkar.count!) { 
        onIncrementCount(athkar.id);
      }
    } else {
      onToggleComplete(athkar.id);
    }
  }, [isCountable, currentCompletedCount, athkar.count, athkar.id, onIncrementCount, onToggleComplete]);


  const handleToggleAutoCount = useCallback(() => {
    if (isCountable && athkar.readingTimeSeconds && athkar.readingTimeSeconds > 0) {
      if (isAutoCounting) {
        setIsAutoCounting(false);
      } else if (!isFullyCompleted) {
        setIsAutoCounting(true);
      }
    }
  }, [isCountable, athkar.readingTimeSeconds, isAutoCounting, isFullyCompleted]);

  const circumference = 2 * Math.PI * 15.9155; 
  const progressPercentage = athkar.count ? (currentCompletedCount / athkar.count) : 0;


  return (
    <Card className={`w-full shadow-lg transition-all duration-300 ease-in-out transform hover:shadow-xl ${isFullyCompleted ? 'bg-primary/10 border-primary/50' : 'bg-card'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {dragHandleProps && (
              <div {...dragHandleProps} className="p-1 cursor-grab text-muted-foreground hover:text-foreground mr-2 rtl:ml-2 rtl:mr-0">
                <GripVertical size={20} />
              </div>
            )}
            {athkar.text && <CardTitle className="text-lg font-semibold text-primary">{athkar.text}</CardTitle>}
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
        {athkar.category && <CardDescription className="text-xs text-muted-foreground mt-1">{athkar.category}</CardDescription>}
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-2xl leading-relaxed text-center font-arabic text-foreground mb-4" lang="ar" dir="rtl">
          {athkar.arabic}
        </p>

        {showVirtue && athkar.virtue && (
          <div className="mb-4 p-3 bg-accent/10 rounded-md border border-accent/30">
            <p className="text-sm text-accent-foreground/90" dir="rtl">{athkar.virtue}</p>
          </div>
        )}

        {isCountable ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>التكرار: {currentCompletedCount} / {athkar.count}</span>
              {isFullyCompleted && <Badge variant="default" className="bg-green-600 text-white">مكتمل</Badge>}
            </div>
            
            <div className="flex items-center justify-center gap-3 sm:gap-4 my-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDecrementCount(athkar.id)}
                disabled={currentCompletedCount === 0 || isAutoCounting}
                aria-label="إنقاص العد"
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
              >
                <MinusCircle size={20} />
              </Button>

              <button
                onClick={handleMainAction}
                disabled={isFullyCompleted || isAutoCounting}
                aria-label={isFullyCompleted ? "مكتمل" : "زيادة العد"}
                className={`relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                            ${isFullyCompleted || isAutoCounting ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 cursor-pointer'}`}
              >
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
                  <circle
                    className="text-gray-300/50 dark:text-gray-700/50"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="transparent"
                    r="15.9155" 
                    cx="18"
                    cy="18"
                  />
                  <circle
                    className="text-green-500 transition-all duration-300 ease-linear"
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
                <span className={`relative z-10 text-xl sm:text-2xl font-semibold ${isFullyCompleted || isAutoCounting ? '' : 'text-primary-foreground'}`}>
                  {currentCompletedCount}
                </span>
              </button>

              {isCountable && athkar.readingTimeSeconds && athkar.readingTimeSeconds > 0 ? (
                <Button
                  variant={isAutoCounting ? "destructive" : "outline"}
                  size="icon"
                  onClick={handleToggleAutoCount}
                  disabled={(!isAutoCounting && (isFullyCompleted || !athkar.readingTimeSeconds || athkar.readingTimeSeconds <= 0))}
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                  aria-label={isAutoCounting ? "إيقاف التعداد التلقائي" : "بدء التعداد التلقائي"}
                >
                  {isAutoCounting ? <Pause size={20} /> : <Play size={20} />}
                </Button>
              ) : (
                 <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"></div> 
              )}
            </div>

            {isFullyCompleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!isAutoCounting) onResetCount(athkar.id);
                }}
                className="w-full text-xs text-muted-foreground hover:text-primary mt-2"
                aria-label="إعادة تعيين العد"
                disabled={isAutoCounting}
              >
                <Repeat size={14} className="mr-1 rtl:ml-1 rtl:mr-0" /> إعادة تعيين
              </Button>
            )}
          </div>
        ) : (
          <Button
            variant={athkar.completed ? "secondary" : "default"}
            onClick={handleMainAction}
            className="w-full"
            aria-label={athkar.completed ? "تمييز كغير مكتمل" : "تمييز كمكتمل"}
          >
            {athkar.completed ? (
              <CheckCircle2 size={20} className="mr-2 rtl:ml-2 rtl:mr-0 text-green-500" />
            ) : (
              <Circle size={20} className="mr-2 rtl:ml-2 rtl:mr-0" />
            )}
            {athkar.completed ? 'مكتمل' : 'إكمال الذكر'}
          </Button>
        )}
      </CardContent>
      {athkar.readingTimeSeconds && (
         <CardFooter className="text-xs text-muted-foreground pt-2 pb-3 justify-end">
            <p>زمن القراءة المقدر: {athkar.readingTimeSeconds} ثانية</p>
         </CardFooter>
        )}
    </Card>
  );
}
