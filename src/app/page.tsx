
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, ListCollapse } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'athkari_groups';

export default function HomePage() {
  const [groups, setGroups] = useState<AthkarGroup[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [hydrated, setHydrated] = useState(false); // New state to track hydration
  const { toast } = useToast();

  // Load groups from localStorage on initial mount
  useEffect(() => {
    const storedGroupsString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedGroupsString) {
      try {
        setGroups(JSON.parse(storedGroupsString));
      } catch (e) {
        console.error("Failed to parse stored groups:", e);
        setGroups([]); // Fallback to empty array on error
      }
    }
    setHydrated(true); // Mark as hydrated after attempting to load
  }, []);

  // Save groups to localStorage whenever groups state changes, but only if hydrated
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(groups));
    }
  }, [groups, hydrated]);

  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم للمجموعة.",
        variant: "destructive",
      });
      return;
    }
    const newGroup: AthkarGroup = {
      id: Date.now().toString(), // Simple unique ID
      name: newGroupName.trim(),
    };
    setGroups((prevGroups) => [...prevGroups, newGroup]);
    setNewGroupName('');
    setIsDialogOpen(false);
    toast({
      title: "تم بنجاح",
      description: `تمت إضافة مجموعة "${newGroup.name}".`,
    });
  };

  if (!hydrated) {
    // Optional: render a loading state or null while hydrating
    return (
      <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background text-foreground">
      <header className="w-full max-w-3xl mb-8 text-center">
        <h1 className="text-5xl font-bold text-primary flex items-center justify-center">
          <ListCollapse className="mr-3 rtl:ml-3 rtl:mr-0 h-12 w-12 text-accent" />
          مجموعات أذكاري
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          أنشئ ونظم مجموعات الأذكار الخاصة بك.
        </p>
      </header>

      <main className="w-full max-w-3xl flex-grow">
        {groups.length === 0 ? (
          <p className="text-center text-muted-foreground py-10 text-xl">
            لا توجد مجموعات حتى الآن. اضغط على زر '+' لإضافة مجموعتك الأولى!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Link key={group.id} href={`/group/${group.id}`} passHref>
                <Button variant="outline" className="w-full h-24 text-lg justify-center items-center p-4 shadow-md hover:shadow-lg transition-shadow">
                  {group.name}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-8 right-8 rtl:left-8 rtl:right-auto h-16 w-16 rounded-full shadow-lg z-50 text-2xl"
            size="icon"
            aria-label="إضافة مجموعة جديدة"
          >
            <Plus size={32} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة مجموعة أذكار جديدة</DialogTitle>
            <DialogDescription>
              أدخل اسمًا لمجموعتك الجديدة. يمكنك إضافة الأذكار إليها لاحقًا.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group-name" className="text-right rtl:text-left col-span-1">
                اسم المجموعة
              </Label>
              <Input
                id="group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="col-span-3"
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

      <footer className="w-full max-w-3xl mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Athkari App. كل لحظة ذكر هي كنز.
        </p>
      </footer>
    </div>
  );
}
