"use client";

import type { Athkar } from '@/types';
import { suggestAthkar, type SuggestAthkarInput } from '@/ai/flows/suggest-athkar';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AthkarSuggestionsProps {
  allAthkar: Athkar[];
}

export function AthkarSuggestions({ allAthkar }: AthkarSuggestionsProps) {
  const [preferences, setPreferences] = useState<string>('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // This state will be used to construct completionHistory from parent or context if needed
  // For now, we simulate it or assume it's passed correctly
  const [currentAthkarStatus, setCurrentAthkarStatus] = useState<Athkar[]>(allAthkar);

  useEffect(() => {
    // If Athkar list updates from parent, reflect it here
    setCurrentAthkarStatus(allAthkar);
  }, [allAthkar]);


  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setRecommendations([]);

    const completionHistory = currentAthkarStatus.map(a => ({
      athkar: a.text, // Using text as identifier, as per flow's potential expectation
      completed: a.count ? (a.completedCount ?? 0) >= a.count : a.completed,
    }));

    const input: SuggestAthkarInput = {
      completionHistory,
      preferences: preferences || undefined,
    };

    try {
      const result = await suggestAthkar(input);
      if (result && result.recommendations) {
        setRecommendations(result.recommendations);
        if (result.recommendations.length === 0) {
          toast({
            title: "No specific suggestions",
            description: "You're doing great, or try refining your preferences!",
          });
        }
      } else {
        throw new Error("No recommendations found in the result.");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast({
        title: "Error",
        description: "Could not fetch suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Lightbulb size={24} className="mr-2 rtl:ml-2 rtl:mr-0 text-accent" />
          Personalized Athkar Suggestions
        </CardTitle>
        <CardDescription>
          Get AI-powered recommendations to enhance your Athkar practice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="preferences" className="text-sm font-medium">
            Your Preferences (Optional)
          </Label>
          <Textarea
            id="preferences"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="e.g., 'Focus on short Athkar', 'More for tranquility', 'Related to gratitude'"
            className="mt-1"
            rows={3}
          />
        </div>
        <Button onClick={handleGetSuggestions} disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4 animate-spin" />
              Getting Suggestions...
            </>
          ) : (
            "Suggest Athkar"
          )}
        </Button>
      </CardContent>
      {recommendations.length > 0 && (
        <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
          <h4 className="font-semibold text-md text-primary">Recommendations:</h4>
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
