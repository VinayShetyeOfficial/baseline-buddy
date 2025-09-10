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
import { PolyfillSchema } from '@/ai/schemas';

const GeneratePolyfillsInputSchema = z.object({
  codeSnippet: z
    .string()
    .describe('The code snippet to generate polyfills for.'),
  targetBrowsers: z
    .string()
    .describe('The target browsers to generate polyfills for.'),
});
export type GeneratePolyfillsInput = z.infer<typeof GeneratePolyfillsInputSchema>;

const GeneratePolyfillsOutputSchema = z.object({
  polyfills: z
    .array(PolyfillSchema)
    .describe('An array of polyfills with explanations. If no polyfills are needed, return an empty array or an array with a comment in the code field.'),
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

When analyzing a full repository, the code snippet will contain file paths in comments like '// File: path/to/file.js'. If a polyfill is needed for a specific file, you MUST include the 'filePath' field in your response for that polyfill, extracting the path from the comment.

If no polyfills are required for the given code and target browsers, return an array with a single item containing an explanatory comment in the 'code' field and a clear explanation.

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
