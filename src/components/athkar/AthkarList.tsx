
"use client";

import type { StoredAthkar } from '@/types';
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
  const visibleAthkar = isSortMode ? athkarList : athkarList.filter(thikr => !thikr.isSessionHidden);

  if (visibleAthkar.length === 0 && !isSortMode) { // Only show placeholder if no visible items in normal mode
    return (
      <div className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-card">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-muted-foreground mb-4"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        <h2 className="text-xl font-semibold text-foreground mb-2">لا توجد أذكار في هذه المجموعة بعد أو تم إكمال جميع الأذكار لهذه الجلسة</h2>
        <p className="text-muted-foreground">
          استخدم الزر العائم (+) في أسفل الشاشة لإضافة ذكر جديد، أو قم بإعادة تعيين الجلسة لرؤية الأذكار المكتملة.
        </p>
      </div>
    );
  }
  if (athkarList.length === 0) { // If list is truly empty, show this for sort mode too
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
    <Droppable droppableId="athkarDroppable" isDropDisabled={!isSortMode}>
      {(provided) => (
        <div 
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={cn("w-full", isSortMode ? 'space-y-2' : 'space-y-4')}
        >
          {athkarList.map((thikr, index) => {
            // If not in sort mode AND the item is session hidden, don't render it at all.
            if (!isSortMode && thikr.isSessionHidden) {
              return null;
            }
            return (
              <Draggable key={thikr.id} draggableId={thikr.id} index={index} isDragDisabled={!isSortMode && thikr.isSessionHidden}>
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
                    draggableProps={providedDraggable.draggableProps}
                    dragHandleProps={providedDraggable.dragHandleProps}
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

