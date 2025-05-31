
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
    <Droppable droppableId="athkarDroppable" isDropDisabled={false}>
      {(provided) => (
        <div 
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={cn("space-y-0")} // space-y will be handled by AthkarItem's margin
        >
          {athkarList.map((thikr, index) => (
            <Draggable key={thikr.id} draggableId={thikr.id} index={index} isDragDisabled={false}>
              {(providedDraggable) => (
                <AthkarItem
                  ref={providedDraggable.innerRef} // Pass innerRef as ref
                  draggableProps={providedDraggable.draggableProps} // Pass draggableProps
                  athkar={thikr}
                  onToggleComplete={onToggleComplete}
                  onIncrementCount={onIncrementCount}
                  onDecrementCount={onDecrementCount}
                  onEditAthkar={() => onEditAthkar(thikr)}
                  onDeleteAthkar={() => onDeleteAthkar(thikr)}
                  dragHandleProps={providedDraggable.dragHandleProps}
                  fontSizeMultiplier={fontSizeMultiplier}
                  isSortMode={isSortMode}
                />
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
