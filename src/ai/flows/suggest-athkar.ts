// 'use server';
/**
 * @fileOverview Personalized Athkar recommendation flow.
 *
 * - suggestAthkar - A function that provides personalized Athkar recommendations.
 * - SuggestAthkarInput - The input type for the suggestAthkar function.
 * - SuggestAthkarOutput - The return type for the suggestAthkar function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAthkarInputSchema = z.object({
  completionHistory: z
    .array(z.object({athkar: z.string(), completed: z.boolean()}))
    .describe('The user athkar completion history.'),
  preferences: z
    .string()
    .optional()
    .describe('The user preferences for Athkar, if any.'),
});
export type SuggestAthkarInput = z.infer<typeof SuggestAthkarInputSchema>;

const SuggestAthkarOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('The personalized Athkar recommendations.'),
});
export type SuggestAthkarOutput = z.infer<typeof SuggestAthkarOutputSchema>;

export async function suggestAthkar(input: SuggestAthkarInput): Promise<SuggestAthkarOutput> {
  return suggestAthkarFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAthkarPrompt',
  input: {schema: SuggestAthkarInputSchema},
  output: {schema: SuggestAthkarOutputSchema},
  prompt: `Based on the user's Athkar completion history and preferences, provide personalized Athkar recommendations.

Completion History:
{{#each completionHistory}}
  - {{athkar}}: {{completed}}
{{/each}}

Preferences: {{preferences}}

Recommendations:`, // Handlebars syntax is correct here.
});

const suggestAthkarFlow = ai.defineFlow(
  {
    name: 'suggestAthkarFlow',
    inputSchema: SuggestAthkarInputSchema,
    outputSchema: SuggestAthkarOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
