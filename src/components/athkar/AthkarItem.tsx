
"use client";

import type { Athkar } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, PlusCircle, MinusCircle, Repeat, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface AthkarItemProps {
  athkar: Athkar;
  onToggleComplete: (id: string) => void;
  onIncrementCount: (id: string) => void;
  onDecrementCount: (id: string) => void;
  onResetCount: (id: string) => void;
}

export function AthkarItem({
  athkar,
  onToggleComplete,
  onIncrementCount,
  onDecrementCount,
  onResetCount
}: AthkarItemProps) {
  const isCountable = typeof athkar.count === 'number' && athkar.count > 0;
  const currentCompletedCount = athkar.completedCount ?? 0;
  const isFullyCompleted = isCountable ? currentCompletedCount >= athkar.count : athkar.completed;

  const handleMainAction = () => {
    if (isCountable) {
      if (currentCompletedCount < athkar.count) {
        onIncrementCount(athkar.id);
      }
    } else {
      onToggleComplete(athkar.id);
    }
  };

  return (
    <Card className={`w-full shadow-lg transition-all duration-300 ease-in-out transform hover:shadow-xl ${isFullyCompleted ? 'bg-primary/10 border-primary/50' : 'bg-card'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          {athkar.text && <CardTitle className="text-lg font-semibold text-primary">{athkar.text}</CardTitle>}
          {athkar.virtue && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent-foreground">
                  <Info size={20} />
                  <span className="sr-only">عرض فضل الذكر</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent side="left" className="w-80 text-sm p-4 shadow-md" dir="rtl">
                <p className="font-semibold mb-2 text-primary">فضل الذكر:</p>
                <p>{athkar.virtue}</p>
              </PopoverContent>
            </Popover>
          )}
        </div>
        {athkar.category && <CardDescription className="text-xs text-muted-foreground">{athkar.category}</CardDescription>}
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
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDecrementCount(athkar.id)}
                disabled={currentCompletedCount === 0}
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
                disabled={isFullyCompleted}
                aria-label="زيادة العد"
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <PlusCircle size={16} className="mr-1 rtl:ml-1 rtl:mr-0" />
                {isFullyCompleted ? "مكتمل" : "زيادة"}
              </Button>
            </div>
            {isFullyCompleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onResetCount(athkar.id)}
                className="w-full text-xs text-muted-foreground hover:text-primary mt-2"
                aria-label="إعادة تعيين العد"
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
