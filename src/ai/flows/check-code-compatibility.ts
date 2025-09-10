'use server';

/**
 * @fileOverview A code compatibility checker AI agent.
 *
 * - checkCodeCompatibility - A function that handles the code compatibility checking process.
 * - CheckCodeCompatibilityInput - The input type for the checkCodeCompatibility function.
 * - CheckCodeCompatibilityOutput - The return type for the checkCodeCompatibility function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckCodeCompatibilityInputSchema = z.object({
  codeSnippet: z
    .string()
    .describe('The code snippet to check for browser compatibility.'),
});
export type CheckCodeCompatibilityInput = z.infer<typeof CheckCodeCompatibilityInputSchema>;

const CheckCodeCompatibilityOutputSchema = z.object({
  compatibilityReport: z.string().describe('A report of the browser compatibility of the code snippet, including user coverage percentages. The report should be in well-structured Markdown format.'),
});
export type CheckCodeCompatibilityOutput = z.infer<typeof CheckCodeCompatibilityOutputSchema>;

export async function checkCodeCompatibility(input: CheckCodeCompatibilityInput): Promise<CheckCodeCompatibilityOutput> {
  return checkCodeCompatibilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkCodeCompatibilityPrompt',
  input: {schema: CheckCodeCompatibilityInputSchema},
  output: {schema: CheckCodeCompatibilityOutputSchema},
  prompt: `You are an expert web developer specializing in browser compatibility.

You will analyze the provided code snippet and generate a detailed compatibility report in well-structured Markdown. The report should be easy to read, with clear paragraphs, headings, and lists. Use backticks for inline code.

Analyze the following code snippet:
\`\`\`
{{{codeSnippet}}}
\`\`\`

Generate the compatibility report below:`,
});

const checkCodeCompatibilityFlow = ai.defineFlow(
  {
    name: 'checkCodeCompatibilityFlow',
    inputSchema: CheckCodeCompatibilityInputSchema,
    outputSchema: CheckCodeCompatibilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
