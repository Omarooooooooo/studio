
"use client";

import type { Athkar } from '@/types';
import { suggestAthkar, type SuggestAthkarInput } from '@/ai/flows/suggest-athkar';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Lightbulb } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast'; // Toasts are being removed

interface AthkarSuggestionsProps {
  allAthkar: Athkar[]; 
}

export function AthkarSuggestions({ allAthkar }: AthkarSuggestionsProps) {
  const [preferences, setPreferences] = useState<string>('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const { toast } = useToast(); // Toasts are being removed


  const handleGetSuggestions = useCallback(async () => {
    setIsLoading(true);
    setRecommendations([]);

    const completionHistory = allAthkar.map(a => ({
      athkar: a.arabic, 
      completed: a.count ? (a.completedCount ?? 0) >= a.count : !!a.completedCount, // Simplified: if count exists, check against it, else check if completedCount > 0
    }));

    const input: SuggestAthkarInput = {
      completionHistory,
      preferences: preferences.trim() || undefined,
    };

    try {
      const result = await suggestAthkar(input);
      if (result && result.recommendations) {
        setRecommendations(result.recommendations);
        if (result.recommendations.length === 0) {
          // toast({
          //   title: "لا توجد اقتراحات محددة",
          //   description: "أنت تقوم بعمل رائع، أو حاول تحسين تفضيلاتك!",
          // });
        } else {
            // toast({
            //     title: "اقتراحات جديدة",
            //     description: "تم العثور على اقتراحات أذكار مخصصة لك."
            // })
        }
      } else {
        setRecommendations([]);
        // toast({
        //     title: "لا توجد اقتراحات",
        //     description: "لم يتمكن الذكاء الاصطناعي من إيجاد اقتراحات بناءً على المدخلات الحالية.",
        // });
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      // toast({
      //   title: "خطأ في الاقتراحات",
      //   description: "لم نتمكن من جلب الاقتراحات. الرجاء المحاولة مرة أخرى.",
      //   variant: "destructive",
      // });
    } finally {
      setIsLoading(false);
    }
  }, [allAthkar, preferences]);

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Lightbulb size={24} className="mr-2 rtl:ml-2 rtl:mr-0 text-accent" />
          اقتراحات أذكار مخصصة
        </CardTitle>
        <CardDescription>
          احصل على توصيات مدعومة بالذكاء الاصطناعي لتعزيز ممارستك للأذكار.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="preferences" className="text-sm font-medium">
            تفضيلاتك (اختياري)
          </Label>
          <Textarea
            id="preferences"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="مثال: 'أذكار قصيرة'، 'للطمأنينة'، 'أذكار الحمد والشكر'"
            className="mt-1"
            rows={3}
            dir="rtl"
          />
        </div>
        <Button onClick={handleGetSuggestions} disabled={isLoading || allAthkar.length === 0} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4 animate-spin" />
              جاري جلب الاقتراحات...
            </>
          ) : (
            "اقترح أذكار"
          )}
        </Button>
         {allAthkar.length === 0 && <p className="text-xs text-muted-foreground text-center">أضف بعض الأذكار للمجموعة أولاً لتتمكن من الحصول على اقتراحات.</p>}
      </CardContent>
      {recommendations.length > 0 && (
        <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
          <h4 className="font-semibold text-md text-primary">التوصيات:</h4>
          <ul className="list-disc pl-5 rtl:pr-5 rtl:pl-0 space-y-1 text-sm text-foreground">
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </CardFooter>
      )}
    </Card>
  );
}
