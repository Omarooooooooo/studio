
"use client";

import { AthkarItem } from './AthkarItem';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import type { AthkarInSession } from '@/app/group/[groupId]/page'; 
import { cn } from '@/lib/utils';


interface AthkarListProps {
  athkarList: AthkarInSession[];
  onToggleComplete: (id: string) => void;
  onIncrementCount: (id: string) => void;
  onDecrementCount: (id: string) => void;
  onEditAthkar: (athkar: AthkarInSession) => void;
  onDeleteAthkar: (athkar: AthkarInSession) => void;
  fontSizeMultiplier: number;
  isSortMode: boolean;
}

export function AthkarList({ 
  athkarList, 
  onToggleComplete, 
  onIncrementCount, 
  onDecrementCount,
  onEditAthkar,
  onDeleteAthkar,
  fontSizeMultiplier,
  isSortMode
}: AthkarListProps) {
  const visibleAthkarInNormalMode = athkarList.filter(thikr => !thikr.isSessionHidden);
  
  if (athkarList.length === 0) {
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

  if (!isSortMode && visibleAthkarInNormalMode.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-card">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-muted-foreground mb-4"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        <h2 className="text-xl font-semibold text-foreground mb-2">تم إكمال جميع الأذكار لهذه الجلسة</h2>
        <p className="text-muted-foreground">
          قم بإعادة تعيين الجلسة لرؤية الأذكار مرة أخرى، أو يمكنك إضافة أذكار جديدة للمجموعة.
        </p>
      </div>
    );
  }

  return (
    <Droppable droppableId="athkarDroppable" isDropDisabled={false}>
      {(provided) => (
        <div 
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={cn("w-full", isSortMode ? 'space-y-2' : 'space-y-4')}
        >
          {athkarList.map((thikr, index) => {
            if (!isSortMode && thikr.isSessionHidden) {
              return null;
            }
            return (
              <Draggable key={thikr.id} draggableId={thikr.id} index={index} isDragDisabled={false}>
                {(providedDraggable) => (
                  <AthkarItem
                    ref={providedDraggable.innerRef}
                    athkar={thikr}
                    onToggleComplete={onToggleComplete}
                    onIncrementCount={onIncrementCount}
                    onDecrementCount={onDecrementCount}
                    onEditAthkar={() => onEditAthkar(thikr)}
                    onDeleteAthkar={() => onDeleteAthkar(thikr)}
                    fontSizeMultiplier={fontSizeMultiplier}
                    isSortMode={isSortMode}
                    draggableProps={{...providedDraggable.draggableProps, ...providedDraggable.dragHandleProps}}
                  />
                )}
              </Draggable>
            );
          })}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
