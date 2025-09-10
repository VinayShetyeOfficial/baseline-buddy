import { z } from "genkit";

export const SuggestionSchema = z.object({
  filePath: z.string().optional().describe('The path to the file where the suggestion applies. Only present when analyzing a repository.'),
  lineNumber: z.number().optional().describe('The line number in the file where the suggestion applies. Only present when analyzing a repository.'),
  code: z.string().describe('The compatible code snippet.'),
  explanation: z
    .string()
    .describe(
      'An explanation of why the original code is not compatible and how the suggestion fixes it.'
    ),
});
export type Suggestion = z.infer<typeof SuggestionSchema>;

export const PolyfillSchema = z.object({
    filePath: z.string().optional().describe('The path to the file where the polyfill is needed. Only present when analyzing a repository.'),
    lineNumber: z.number().optional().describe('The line number in the file where the polyfill is needed. Only present when analyzing a repository.'),
    code: z.string().describe('The polyfill code snippet. If no polyfill is needed, this might be a comment explaining why.'),
    explanation: z
      .string()
      .describe(
        'An explanation of what this polyfill does and which feature it is for.'
      ),
  });
export type Polyfill = z.infer<typeof PolyfillSchema>;
