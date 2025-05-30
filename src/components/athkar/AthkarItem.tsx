
"use client";

import type { Athkar } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, PlusCircle, MinusCircle, Repeat, Info, Edit3, Trash2, Play, Pause, GripVertical } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
      if (isFullyCompleted && isAutoCounting) { // If it stopped because it's fully completed
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
      if (currentCompletedCount < athkar.count!) { // athkar.count is defined due to isCountable
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent-foreground h-8 w-8">
                    <Info size={18} />
                    <span className="sr-only">عرض فضل الذكر</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="left" className="w-80 text-sm p-4 shadow-md" dir="rtl">
                  <p className="font-semibold mb-2 text-primary">فضل الذكر:</p>
                  <p>{athkar.virtue}</p>
                </PopoverContent>
              </Popover>
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
        <p className="text-2xl leading-relaxed text-right font-arabic text-foreground mb-4" lang="ar" dir="rtl">
          {athkar.arabic}
        </p>

        {isCountable ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>التكرار: {currentCompletedCount} / {athkar.count}</span>
              {isFullyCompleted && <Badge variant="default" className="bg-green-500 text-white">مكتمل</Badge>}
            </div>
            <Progress 
              value={athkar.count ? (currentCompletedCount / athkar.count) * 100 : 0} 
              className="h-3 [&>div]:bg-green-500" 
              aria-label={`تقدم الذكر: ${currentCompletedCount} من ${athkar.count}`}
            />
            <div className="flex gap-2 justify-center items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDecrementCount(athkar.id)}
                disabled={currentCompletedCount === 0 || isAutoCounting}
                aria-label="إنقاص العد"
                className="flex-1"
              >
                <MinusCircle size={16} className="mr-1 rtl:ml-1 rtl:mr-0" />
                إنقاص
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleMainAction}
                disabled={isFullyCompleted || isAutoCounting}
                aria-label="زيادة العد"
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <PlusCircle size={16} className="mr-1 rtl:ml-1 rtl:mr-0" />
                {isFullyCompleted ? "مكتمل" : "زيادة"}
              </Button>
              {athkar.readingTimeSeconds && athkar.readingTimeSeconds > 0 && (
                <Button
                  variant={isAutoCounting ? "destructive" : "outline"}
                  size="icon"
                  onClick={handleToggleAutoCount}
                   disabled={(!isAutoCounting && (isFullyCompleted || !isCountable || !athkar.readingTimeSeconds || athkar.readingTimeSeconds <= 0))}
                  className="h-9 w-9"
                  aria-label={isAutoCounting ? "إيقاف التعداد التلقائي" : "بدء التعداد التلقائي"}
                >
                  {isAutoCounting ? <Pause size={16} /> : <Play size={16} />}
                </Button>
              )}
            </div>
            {isFullyCompleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onResetCount(athkar.id)}
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
