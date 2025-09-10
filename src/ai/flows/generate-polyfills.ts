'use server';
/**
 * @fileOverview A flow that generates polyfills for unsupported features in target browsers based on baseline data.
 *
 * - generatePolyfills - A function that handles the polyfill generation process.
 * - GeneratePolyfillsInput - The input type for the generatePolyfills function.
 * - GeneratePolyfillsOutput - The return type for the generatePolyfills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePolyfillsInputSchema = z.object({
  codeSnippet: z
    .string()
    .describe('The code snippet to generate polyfills for.'),
  targetBrowsers: z
    .string()
    .describe('The target browsers to generate polyfills for.'),
});
export type GeneratePolyfillsInput = z.infer<typeof GeneratePolyfillsInputSchema>;

const PolyfillSchema = z.object({
  code: z.string().describe('The polyfill code snippet.'),
  explanation: z
    .string()
    .describe(
      'An explanation of what this polyfill does and which feature it is for.'
    ),
});

const GeneratePolyfillsOutputSchema = z.object({
  polyfills: z
    .array(PolyfillSchema)
    .describe('An array of polyfills with explanations. If no polyfills are needed, return an empty array.'),
});
export type GeneratePolyfillsOutput = z.infer<typeof GeneratePolyfillsOutputSchema>;


export async function generatePolyfills(input: GeneratePolyfillsInput): Promise<GeneratePolyfillsOutput> {
  return generatePolyfillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePolyfillsPrompt',
  input: {schema: GeneratePolyfillsInputSchema},
  output: {schema: GeneratePolyfillsOutputSchema},
  prompt: `You are a polyfill generator expert.

You will generate polyfills for the unsupported features in the target browsers based on the baseline data. The generated code must be well-formatted JavaScript. For each polyfill, provide a clear explanation of what it does and which feature it addresses.

If no polyfills are required for the given code and target browsers, return an empty array for the 'polyfills' field.

Code Snippet: {{{codeSnippet}}}
Target Browsers: {{{targetBrowsers}}}

Generate the polyfills and explanations below:`,
});

const generatePolyfillsFlow = ai.defineFlow(
  {
    name: 'generatePolyfillsFlow',
    inputSchema: GeneratePolyfillsInputSchema,
    outputSchema: GeneratePolyfillsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
