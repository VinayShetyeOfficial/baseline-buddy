
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
  targetBrowsers: z.string().describe('A comma-separated list of target browsers (e.g., chrome, firefox, safari).')
});
export type CheckCodeCompatibilityInput = z.infer<typeof CheckCodeCompatibilityInputSchema>;


const BrowserCompatibilitySchema = z.object({
  browser: z.string().describe("The name of the browser (e.g., 'Chrome', 'Firefox')."),
  isSupported: z.boolean().describe("Whether the features in the code snippet are fully supported by this browser."),
  coverage: z.number().describe("The estimated percentage of global users for this browser version."),
});
export type BrowserCompatibilityData = z.infer<typeof BrowserCompatibilitySchema>;

const CheckCodeCompatibilityOutputSchema = z.object({
  compatibilityReport: z.string().describe('A detailed, well-structured Markdown report of the browser compatibility of the code snippet.'),
  browserData: z.array(BrowserCompatibilitySchema).describe('An array of objects containing browser compatibility data for charting.')
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

You will analyze the provided code snippet against the specified target browsers. Your response must be a JSON object containing two fields: 'browserData' and 'compatibilityReport'.

1.  **browserData**: An array of objects, where each object represents a target browser and contains:
    *   'browser': The name of the browser.
    *   'isSupported': A boolean indicating if the features in the code are fully supported.
    *   'coverage': An estimated percentage of global user coverage for that browser.

2.  **compatibilityReport**: A detailed compatibility report in well-structured Markdown. The report should be easy to read, with clear paragraphs, headings, and lists. Use backticks for inline code.

Analyze the following code snippet:
\`\`\`
{{{codeSnippet}}}
\`\`\`

For the target browsers: {{{targetBrowsers}}}

Generate the JSON response below:`,
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
