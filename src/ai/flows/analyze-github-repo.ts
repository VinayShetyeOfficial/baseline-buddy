
'use server';
/**
 * @fileOverview A flow that analyzes a GitHub repository for browser compatibility.
 *
 * This flow takes a public GitHub repository URL, fetches all relevant code files,
 * combines them, and then makes a single, efficient call to a generative AI model
 * to produce a comprehensive compatibility report, code suggestions, and necessary
 * polyfills. This consolidated approach prevents API rate limit errors that could
 * occur from making multiple separate calls for a large codebase.
 *
 * - analyzeGitHubRepository - A function that handles the GitHub repository analysis process.
 * - AnalyzeGitHubRepositoryInput - The input type for the analyzeGitHubRepository function.
 * - AnalyzeGitHubRepositoryOutput - The return type for the analyzeGitHubRepository function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Octokit } from '@octokit/rest';
import {
  CheckCodeCompatibilityOutput,
  BrowserCompatibilityData
} from './check-code-compatibility';
import {
  GeneratePolyfillsOutput,
} from './generate-polyfills';
import {
  SuggestCompatibleSnippetsOutput,
} from './suggest-compatible-snippets';
import { PolyfillSchema, SuggestionSchema } from '@/ai/schemas';

// Initialize Octokit without authentication for public repositories
const octokit = new Octokit();

const AnalyzeGitHubRepositoryInputSchema = z.object({
  repoUrl: z.string().url().describe('The URL of the public GitHub repository.'),
  targetBrowsers: z
    .string()
    .describe(
      'A comma-separated list of target browsers (e.g., chrome, firefox, safari).'
    ),
});
export type AnalyzeGitHubRepositoryInput = z.infer<
  typeof AnalyzeGitHubRepositoryInputSchema
>;

export type AnalyzeGitHubRepositoryOutput = {
  compatibilityReport: CheckCodeCompatibilityOutput;
  suggestions: SuggestCompatibleSnippetsOutput;
  polyfills: GeneratePolyfillsOutput;
};

// This is the new consolidated output schema for the single AI call.
const ConsolidatedAnalysisOutputSchema = z.object({
    compatibilityReport: z.string().describe('A detailed, well-structured Markdown report of the browser compatibility of the code, including user coverage percentages.'),
    browserData: z.array(z.object({
        browser: z.string(),
        isSupported: z.boolean(),
        coverage: z.number(),
    })).describe('An array of objects containing browser compatibility data for charting. The coverage field should represent the global usage share of the browser, regardless of support status.'),
    suggestions: z.array(SuggestionSchema).describe('An array of compatible code snippets with explanations. If none are needed, return an empty array.'),
    polyfills: z.array(PolyfillSchema).describe('An array of polyfills with explanations. If none are needed, return an empty array.'),
});

// Helper function to extract owner and repo from URL
const parseRepoUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== 'github.com') {
      return null;
    }
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      return null;
    }
    const [owner, repo] = pathParts;
    return { owner, repo };
  } catch (error) {
    return null;
  }
};

// Helper function to fetch all file contents from a repository
async function getRepoContents(
  owner: string,
  repo: string
): Promise<string> {
  let combinedCode = '';
  const ignoredExtensions = [
    '.md',
    '.json',
    '.lock',
    '.yml',
    '.yaml',
    '.gitignore',
    '.npmrc',
    '.svg',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
  ];
  const ignoredFiles = ['package-lock.json', 'pnpm-lock.yaml'];

  try {
    const { data: tree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: 'HEAD', // or specify a branch/commit
      recursive: 'true',
    });

    if (tree.truncated) {
      console.warn(`Repository tree is truncated for ${owner}/${repo}. Some files may be missing.`);
    }

    const filePromises = tree.tree
      .filter(
        (item): item is { type: 'blob'; path: string; sha: string } =>
          item.type === 'blob' &&
          item.path !== undefined &&
          item.sha !== undefined &&
          !ignoredExtensions.some(ext => item.path!.endsWith(ext)) &&
          !ignoredFiles.includes(item.path!.split('/').pop()!)
      )
      .map(async item => {
        try {
          const { data: blob } = await octokit.git.getBlob({
            owner,
            repo,
            file_sha: item.sha,
          });
          const content = Buffer.from(blob.content, 'base64').toString('utf8');
          const numberedContent = content.split('\n').map((line, index) => `${index + 1}: ${line}`).join('\n');
          return `
// File: ${item.path}
// ---------------------------------
${numberedContent}
// ---------------------------------
`;
        } catch (error) {
          console.error(`Failed to fetch blob for ${item.path}:`, error);
          return ''; // Return empty string for files that fail
        }
      });

    const fileContents = await Promise.all(filePromises);
    combinedCode = fileContents.join('\n');
  } catch (error) {
    console.error(`Failed to fetch repository contents for ${owner}/${repo}:`, error);
    throw new Error('Could not fetch repository contents. Please ensure the URL is correct and the repository is public.');
  }

  return combinedCode;
}


const analysisPrompt = ai.definePrompt({
    name: 'consolidatedAnalysisPrompt',
    input: { schema: z.object({ codeSnippet: z.string(), targetBrowsers: z.string() }) },
    output: { schema: ConsolidatedAnalysisOutputSchema },
    prompt: `You are an expert web developer and code analysis tool. You will receive a block of code, which may contain multiple files from a repository. Each file's content is preceded by a comment like '// File: path/to/file.js' and each line is numbered.

    Your task is to perform three actions in a single response, provided in a single JSON object:
    1.  **Generate a Compatibility Report:** Create a detailed, well-structured Markdown report about the browser compatibility of the code for the specified target browsers.
    2.  **Provide Browser Data for Charting:** An array of objects, where each object represents a target browser and contains 'browser' (string), 'isSupported' (boolean), and 'coverage' (number) fields. The 'coverage' field must always be a number representing the global usage share of that browser, regardless of its support status.
    3.  **Suggest Compatible Snippets:** Analyze the code and provide an array of suggestions for improving compatibility. For each suggestion, you MUST include the 'originalCode' that needs to be replaced, the 'filePath' and the starting 'lineNumber' for the suggested change, extracting it from the preceding file comment and line number.
    4.  **Generate Polyfills:** Identify features that are not supported by the target browsers and generate an array of the necessary polyfills. For each polyfill, you MUST include the 'filePath' and the 'lineNumber' where the unsupported feature is used.

    IMPORTANT: For any code you generate (suggestions or polyfills), it must be clean, raw, and not escaped in any way.

    Code Snippet:
    \`\`\`
    {{{codeSnippet}}}
    \`\`\`

    Target Browsers: {{{targetBrowsers}}}

    Provide the complete analysis below in the specified JSON format.
    `,
});

const analyzeRepositoryFlow = ai.defineFlow(
    {
        name: 'analyzeRepositoryFlow',
        inputSchema: AnalyzeGitHubRepositoryInputSchema,
        outputSchema: ConsolidatedAnalysisOutputSchema,
    },
    async (input) => {
        const repoInfo = parseRepoUrl(input.repoUrl);
        if (!repoInfo) {
            throw new Error('Invalid GitHub repository URL.');
        }

        const { owner, repo } = repoInfo;
        const combinedCode = await getRepoContents(owner, repo);

        if (!combinedCode.trim()) {
            throw new Error('Could not find any analyzable code in the repository.');
        }

        const { output } = await analysisPrompt({
            codeSnippet: combinedCode,
            targetBrowsers: input.targetBrowsers,
        });

        return output!;
    }
);


export async function analyzeGitHubRepository(
  input: AnalyzeGitHubRepositoryInput
): Promise<AnalyzeGitHubRepositoryOutput> {
  
  const result = await analyzeRepositoryFlow(input);
  
  const addRepoUrl = (item: {originalCode: string, filePath?: string, lineNumber?: number, code: string, explanation: string}) => {
    let finalFilePath = item.filePath ? `${input.repoUrl}/blob/HEAD/${item.filePath}`: undefined;
    if (finalFilePath && item.lineNumber) {
        finalFilePath += `#L${item.lineNumber}`;
    }
    return {
        ...item,
        filePath: finalFilePath
    };
  };

  return { 
      compatibilityReport: {
          compatibilityReport: result.compatibilityReport,
          browserData: result.browserData,
      },
      suggestions: {
          suggestions: result.suggestions.map(addRepoUrl)
      }, 
      polyfills: {
          polyfills: result.polyfills.map(addRepoUrl)
      }
  };
}
