"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { AthkarGroup } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, Edit3, PlusCircle } from 'lucide-react'; // Or ArrowLeft for RTL back button

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const [group, setGroup] = useState<AthkarGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (groupId) {
      const storedGroupsString = localStorage.getItem('athkari_groups');
      if (storedGroupsString) {
        try {
          const storedGroups = JSON.parse(storedGroupsString) as AthkarGroup[];
          const currentGroup = storedGroups.find(g => g.id === groupId);
          setGroup(currentGroup || null);
        } catch (e) {
          console.error("Failed to parse groups from localStorage:", e);
          setGroup(null);
        }
      }
    }
    setIsLoading(false);
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
        <p className="text-lg">جاري تحميل المجموعة...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 bg-background text-foreground">
        <p className="text-xl text-destructive mb-6">لم يتم العثور على المجموعة.</p>
        <Button onClick={() => router.push('/')} variant="outline">
          <ArrowRight className="mr-2 rtl:ml-2 rtl:mr-0" />
          العودة إلى الرئيسية
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background text-foreground">
      <header className="w-full max-w-4xl mb-8">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => router.push('/')} variant="outline" size="sm">
            <ArrowRight className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
            العودة للرئيسية
          </Button>
          {/* Placeholder for future actions like editing group name */}
          {/* <Button variant="ghost" size="icon"><Edit3 className="h-5 w-5" /></Button> */}
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">
            {group.name}
          </h1>
          <p className="text-md text-muted-foreground">
            هنا يمكنك إضافة وإدارة الأذكار الخاصة بمجموعة "{group.name}".
          </p>
        </div>
      </header>
      
      <main className="w-full max-w-4xl flex-grow">
        {/* Content for adding/displaying Athkar for this group will go here */}
        <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
          <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">ابدأ بإضافة الأذكار</h2>
          <p className="text-muted-foreground mb-6">
            هذه المجموعة فارغة حاليًا. اضغط على الزر أدناه لإضافة أول ذكر.
          </p>
          <Button disabled> {/* This button is a placeholder for now */}
            <PlusCircle className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5" />
            إضافة ذكر جديد (قريباً)
          </Button>
        </div>
      </main>
       
      <footer className="w-full max-w-3xl mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Athkari App.
        </p>
      </footer>
    </div>
  );
}
