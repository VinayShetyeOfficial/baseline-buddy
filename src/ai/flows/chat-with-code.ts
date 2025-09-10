
'use server';

/**
 * @fileOverview A flow that allows users to ask follow-up questions about a code analysis report.
 *
 * This flow takes a user's question, the history of the conversation, and the full context
 * of the code and its analysis (compatibility report, suggestions, polyfills) to provide
 * an intelligent and context-aware answer.
 *
 * - chatWithCode - A function that handles the conversational Q&A process.
 * - ChatWithCodeInput - The input type for the chatWithCode function.
 * - ChatWithCodeOutput - The return type for the chatWithCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatMessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const ChatWithCodeInputSchema = z.object({
  question: z.string().describe('The user\'s question about the code or the analysis.'),
  code: z.string().describe('The original code that was analyzed. This could be a snippet or a note about a repository.'),
  analysisReport: z.string().describe('The full markdown compatibility report.'),
  suggestions: z.string().describe('A JSON string of the compatibility suggestions provided.'),
  polyfills: z.string().describe('A JSON string of the polyfills provided.'),
  history: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
});
export type ChatWithCodeInput = z.infer<typeof ChatWithCodeInputSchema>;

const ChatWithCodeOutputSchema = z.object({
  answer: z.string().describe('The AI\'s answer to the user\'s question.'),
});
export type ChatWithCodeOutput = z.infer<typeof ChatWithCodeOutputSchema>;

export async function chatWithCode(input: ChatWithCodeInput): Promise<ChatWithCodeOutput> {
  return chatWithCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithCodePrompt',
  input: { schema: ChatWithCodeInputSchema },
  output: { schema: ChatWithCodeOutputSchema },
  prompt: `You are Baseline Buddy, an expert web developer and code analysis assistant. Your role is to answer follow-up questions from the user about a browser compatibility analysis you have already performed.

You MUST base your answers ONLY on the context provided below, which includes the original code, the compatibility report, suggestions, and polyfills. Do not invent new information or suggestions. Be concise and helpful.

**Analysis Context:**

**1. Original Code Analyzed:**
\`\`\`
{{{code}}}
\`\`\`

**2. Compatibility Report:**
{{{analysisReport}}}

**3. Suggestions Provided:**
\`\`\`json
{{{suggestions}}}
\`\`\`

**4. Polyfills Provided:**
\`\`\`json
{{{polyfills}}}
\`\`\`

**Conversation History:**
{{#each history}}
**{{role}}**: {{content}}
{{/each}}

**User's New Question:**
{{question}}

Based on all the provided context and the conversation history, generate a helpful and concise answer to the user's new question.
`,
});


const chatWithCodeFlow = ai.defineFlow(
  {
    name: 'chatWithCodeFlow',
    inputSchema: ChatWithCodeInputSchema,
    outputSchema: ChatWithCodeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

    