
"use client";

import type { Athkar } from '@/types';
import { AthkarItem } from './AthkarItem';
import { Droppable, Draggable } from 'react-beautiful-dnd';

interface AthkarListProps {
  athkarList: Athkar[];
  onToggleComplete: (id: string) => void;
  onIncrementCount: (id: string) => void;
  onDecrementCount: (id: string) => void;
  onResetCount: (id: string) => void;
  onEditAthkar: (athkar: Athkar) => void;
  onDeleteAthkar: (athkar: Athkar) => void;
}

export function AthkarList({ 
  athkarList, 
  onToggleComplete, 
  onIncrementCount, 
  onDecrementCount,
  onResetCount,
  onEditAthkar,
  onDeleteAthkar
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
    <Droppable droppableId="athkarDroppable">
      {(provided) => (
        <div 
          className="space-y-6"
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          {athkarList.map((thikr, index) => (
            <Draggable key={thikr.id} draggableId={thikr.id} index={index}>
              {(providedDraggable) => (
                <div
                  ref={providedDraggable.innerRef}
                  {...providedDraggable.draggableProps}
                >
                  <AthkarItem
                    athkar={thikr}
                    onToggleComplete={onToggleComplete}
                    onIncrementCount={onIncrementCount}
                    onDecrementCount={onDecrementCount}
                    onResetCount={onResetCount}
                    onEdit={() => onEditAthkar(thikr)}
                    onDelete={() => onDeleteAthkar(thikr)}
                    dragHandleProps={providedDraggable.dragHandleProps}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
