'use server';

/**
 * @fileOverview A code analysis tool that suggests compatible code snippets based on browser baseline data.
 *
 * - suggestCompatibleSnippets - A function that suggests compatible code snippets.
 * - SuggestCompatibleSnippetsInput - The input type for the suggestCompatibleSnippets function.
 * - SuggestCompatibleSnippetsOutput - The return type for the suggestCompatibleSnippets function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCompatibleSnippetsInputSchema = z.object({
  code: z
    .string()
    .describe('The code to analyze and provide compatible snippets for.'),
  targetBrowsers: z
    .string()
    .describe(
      'A comma-separated list of target browsers (e.g., chrome, firefox, safari).'
    ),
});
export type SuggestCompatibleSnippetsInput = z.infer<
  typeof SuggestCompatibleSnippetsInputSchema
>;

const SuggestionSchema = z.object({
  code: z.string().describe('The compatible code snippet.'),
  explanation: z
    .string()
    .describe(
      'An explanation of why the original code is not compatible and how the suggestion fixes it.'
    ),
});

const SuggestCompatibleSnippetsOutputSchema = z.object({
  suggestions: z
    .array(SuggestionSchema)
    .describe('An array of compatible code snippets with explanations.'),
});
export type SuggestCompatibleSnippetsOutput = z.infer<
  typeof SuggestCompatibleSnippetsOutputSchema
>;

export async function suggestCompatibleSnippets(
  input: SuggestCompatibleSnippetsInput
): Promise<SuggestCompatibleSnippetsOutput> {
  return suggestCompatibleSnippetsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCompatibleSnippetsPrompt',
  input: {schema: SuggestCompatibleSnippetsInputSchema},
  output: {schema: SuggestCompatibleSnippetsOutputSchema},
  prompt: `You are a code analysis tool that suggests compatible code snippets based on browser baseline data.

  Analyze the following code and suggest compatible code snippets for the target browsers.

  Code: {{{code}}}
  Target Browsers: {{{targetBrowsers}}}

  For each suggestion, provide the compatible code snippet and a clear explanation of why the change is needed.
  If the code is already fully compatible with the specified browsers, return an empty array for suggestions.
  `,
});

const suggestCompatibleSnippetsFlow = ai.defineFlow(
  {
    name: 'suggestCompatibleSnippetsFlow',
    inputSchema: SuggestCompatibleSnippetsInputSchema,
    outputSchema: SuggestCompatibleSnippetsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
