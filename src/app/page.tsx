
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { AthkarGroup } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, ListCollapse, MoreHorizontal, Edit2, Trash2, Loader2, GripVertical } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from '@/components/ui/card';
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';

const LOCAL_STORAGE_KEY = 'athkari_groups';

export default function HomePage() {
  const [groups, setGroups] = useState<AthkarGroup[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AthkarGroup | null>(null);
  const [editedGroupName, setEditedGroupName] = useState('');

  const [deletingGroup, setDeletingGroup] = useState<AthkarGroup | null>(null);

  const [hydrated, setHydrated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedGroupsString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedGroupsString) {
        try {
          const parsedGroups = JSON.parse(storedGroupsString) as AthkarGroup[];
          const normalizedGroups = parsedGroups.map(group => ({
            ...group,
            athkar: group.athkar || [], 
          }));
          setGroups(normalizedGroups);
        } catch (e) {
          console.error("Failed to parse stored groups:", e);
          setGroups([]);
        }
      }
    }
    setHydrated(true); // Set hydrated to true after attempting to load from localStorage
  }, []);

  useEffect(() => {
    if (hydrated && typeof window !== 'undefined') { // Only save if hydrated
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(groups));
    }
  }, [groups, hydrated]);

  const handleAddGroup = useCallback(() => {
    if (!newGroupName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم للمجموعة.",
        variant: "destructive",
      });
      return;
    }
    const newGroup: AthkarGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      athkar: [],
    };
    setGroups((prevGroups) => [...prevGroups, newGroup]);
    setNewGroupName('');
    setIsAddDialogOpen(false);
    toast({
      title: "تم بنجاح",
      description: `تمت إضافة مجموعة "${newGroup.name}".`,
    });
  }, [newGroupName, toast]);

  const openEditDialog = useCallback((group: AthkarGroup) => {
    setEditingGroup(group);
    setEditedGroupName(group.name);
    setIsEditDialogOpen(true);
  }, []);

  const handleEditGroup = useCallback(() => {
    if (!editingGroup || !editedGroupName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم صحيح للمجموعة.",
        variant: "destructive",
      });
      return;
    }
    setGroups(prevGroups => 
      prevGroups.map(g => g.id === editingGroup.id ? { ...g, name: editedGroupName.trim() } : g)
    );
    setIsEditDialogOpen(false);
    setEditingGroup(null);
    toast({
      title: "تم التعديل",
      description: `تم تغيير اسم المجموعة إلى "${editedGroupName.trim()}".`,
    });
  }, [editingGroup, editedGroupName, toast]);

  const openDeleteDialog = useCallback((group: AthkarGroup) => {
    setDeletingGroup(group);
  }, []);


  const handleDeleteGroup = useCallback(() => {
    if (!deletingGroup) return;
    setGroups(prevGroups => prevGroups.filter(g => g.id !== deletingGroup.id));
    setDeletingGroup(null); // Close dialog after deletion
    toast({
      title: "تم الحذف",
      description: `تم حذف مجموعة "${deletingGroup.name}".`,
      variant: "destructive",
    });
  }, [deletingGroup, toast]);

  const onDragEndGroup = useCallback((result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    setGroups(prevGroups => {
      const reorderedGroups = Array.from(prevGroups);
      const [movedGroup] = reorderedGroups.splice(result.source.index, 1);
      reorderedGroups.splice(result.destination!.index, 0, movedGroup);
      return reorderedGroups;
    });
  }, []);

  if (!hydrated) {
    return (
      <div dir="rtl" className="flex flex-col justify-center items-center min-h-screen bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">جاري تحميل المجموعات...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background text-foreground">
      <header className="w-full max-w-3xl mb-8 text-center">
        <h1 className="text-5xl font-bold text-primary flex items-center justify-center">
          <ListCollapse className="ml-3 rtl:mr-0 rtl:ml-3 h-12 w-12 text-accent" />
          مجموعات أذكاري
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          أنشئ ونظم مجموعات الأذكار الخاصة بك.
        </p>
      </header>

      <main className="w-full max-w-xl flex-grow">
        {groups.length === 0 ? (
          <div className="text-center text-muted-foreground py-10 text-xl border-2 border-dashed border-border rounded-lg bg-card p-6">
             <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-16 w-16 text-primary mb-4"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 22v-1.5"></path><path d="M12 2.5V4"></path><path d="m4.5 11.5-.9-.9"></path><path d="m20.4 12.4-.9-.9"></path><path d="M2 12h1.5"></path><path d="M20.5 12H22"></path><path d="m4.5 12.5.9.9"></path><path d="m20.4 11.6.9.9"></path></svg>
            <h2 className="text-2xl font-semibold text-foreground mb-3">لا توجد مجموعات أذكار بعد</h2>
            <p className="text-muted-foreground mb-6">
             اضغط على زر '+' في الأسفل لإضافة مجموعتك الأولى وابدأ رحلتك مع الأذكار المنظمة.
            </p>
            <Button size="lg" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="ml-2 rtl:mr-0 rtl:ml-2" /> إضافة مجموعتي الأولى
            </Button>
          </div>
        ) : (
          hydrated && ( // Only render DragDropContext on client after hydration
            <DragDropContext onDragEnd={onDragEndGroup}>
              <Droppable droppableId="groupsDroppable">
                {(provided) => (
                  <div
                    className="space-y-4"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {groups.map((group, index) => (
                      <Draggable key={group.id} draggableId={group.id} index={index}>
                        {(providedDraggable) => (
                          <Card
                            ref={providedDraggable.innerRef}
                            {...providedDraggable.draggableProps}
                            className="shadow-md hover:shadow-lg transition-shadow duration-300"
                          >
                            <CardContent className="p-4 flex items-center justify-between">
                              <div {...providedDraggable.dragHandleProps} className="p-2 cursor-grab text-muted-foreground hover:text-foreground">
                                  <GripVertical size={20} />
                              </div>
                              <Link href={`/group/${group.id}`} passHref className="flex-grow mx-2">
                                <span className="text-lg font-semibold text-primary hover:underline cursor-pointer">
                                  {group.name}
                                </span>
                                <p className="text-xs text-muted-foreground">{group.athkar?.length || 0} أذكار</p>
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-5 w-5" />
                                    <span className="sr-only">خيارات المجموعة</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" dir="rtl">
                                  <DropdownMenuItem onClick={() => openEditDialog(group)}>
                                    <Edit2 className="ml-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />
                                    تعديل الاسم
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600 hover:!text-red-600 focus:!text-red-600 hover:!bg-red-50 focus:!bg-red-50"
                                    onClick={() => openDeleteDialog(group)} // Changed to openDeleteDialog
                                    >
                                    <Trash2 className="ml-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />
                                    حذف المجموعة
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )
        )}
      </main>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-8 right-8 rtl:left-8 rtl:right-auto h-16 w-16 rounded-full shadow-lg z-50 text-2xl bg-accent hover:bg-accent/90 text-accent-foreground"
            size="icon"
            aria-label="إضافة مجموعة جديدة"
          >
            <Plus size={32} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة مجموعة أذكار جديدة</DialogTitle>
            <DialogDescription>
              أدخل اسمًا لمجموعتك الجديدة. يمكنك إضافة الأذكار إليها لاحقًا.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="group-name">اسم المجموعة</Label>
              <Input
                id="group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="مثال: أذكار الصباح والمساء"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleAddGroup}>حفظ المجموعة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingGroup && (
        <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
            if (!isOpen) { 
                setEditingGroup(null); 
            }
            setIsEditDialogOpen(isOpen);
        }}>
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل اسم المجموعة</DialogTitle>
              <DialogDescription>
                أدخل الاسم الجديد لمجموعة "{editingGroup.name}".
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-group-name">الاسم الجديد</Label>
                <Input
                  id="edit-group-name"
                  value={editedGroupName}
                  onChange={(e) => setEditedGroupName(e.target.value)}
                  placeholder="الاسم الجديد للمجموعة"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                 <Button variant="outline" onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingGroup(null);
                 }}>إلغاء</Button>
              </DialogClose>
              <Button onClick={handleEditGroup}>حفظ التعديلات</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deletingGroup && (
        <AlertDialog open={!!deletingGroup} onOpenChange={(isOpen) => {
            if (!isOpen) {
                setDeletingGroup(null);
            }
        }}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف مجموعة "{deletingGroup.name}" وجميع الأذكار بداخلها بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingGroup(null)}>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteGroup}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                نعم، حذف المجموعة
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <footer className="w-full max-w-3xl mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Athkari App. كل لحظة ذكر هي كنز.
        </p>
      </footer>
    </div>
  );
}
