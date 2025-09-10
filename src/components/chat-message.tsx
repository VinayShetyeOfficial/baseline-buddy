
'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { js_beautify } from 'js-beautify';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { githubDark } from '@uiw/codemirror-theme-github';

export interface ChatMessageProps {
  role: 'user' | 'model' | 'system';
  content: React.ReactNode;
}

const CodeBlock = ({ code }: { code: string }) => {
    // Clean the code by removing HTML tags and CSS class names
    const cleanCode = code
        // Remove HTML tags with CSS classes (like <span class="text-blue-400">)
        .replace(/<[^>]*class="[^"]*"[^>]*>/g, '')
        // Remove closing HTML tags
        .replace(/<\/[^>]*>/g, '')
        // Remove any remaining HTML tags
        .replace(/<[^>]*>/g, '')
        // Remove CSS class names that might be left over (like 400">"text-blue-400">)
        .replace(/\d+">"[^"]*">/g, '')
        // Remove any other HTML entities or artifacts
        .replace(/&[a-zA-Z0-9#]+;/g, '')
        // Clean up any extra whitespace
        .trim();
    
    const beautifiedCode = js_beautify(cleanCode, {
        indent_size: 2,
        space_in_empty_paren: true,
    });
    
    return (
        <div className="rounded-md border border-border shadow-sm bg-[#0f172b] my-2 overflow-hidden">
            <CodeMirror
                value={beautifiedCode}
                extensions={[javascript({ jsx: true, typescript: true })]}
                theme={githubDark}
                readOnly={true}
                basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    highlightActiveLine: false,
                    autocompletion: false,
                    editable: false,
                    search: false,
                }}
                style={{ fontFamily: '"Source Code Pro", monospace', fontSize: '13px', backgroundColor: '#0f172b' }}
            />
        </div>
    );
};


const renderContent = (content: any) => {
    if (typeof content !== 'string') {
        return content;
    }

    // First, handle fenced code blocks (```code```)
    const fencedCodeRegex = /```([\s\S]*?)```/g;
    const fencedMatches = [...content.matchAll(fencedCodeRegex)];
    
    if (fencedMatches.length > 0) {
        // Split content by fenced code blocks
        const parts = content.split(fencedCodeRegex);
        const result: React.ReactNode[] = [];
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part && part.trim()) {
                if (i % 2 === 0) {
                    // This is text content
                    result.push(<ReactMarkdown key={i}>{part}</ReactMarkdown>);
                } else {
                    // This is code content
                    result.push(<CodeBlock key={i} code={part.trim()} />);
                }
            }
        }
        return <>{result}</>;
    }

    // Enhanced unfenced code detection for multiple code blocks
    const codePatterns = [
        // JavaScript/TypeScript patterns - more specific
        /^(const|let|var|function|class|interface|type|enum)\s+\w+/,
        /^(if|else|for|while|switch|try|catch|async|await)\s*[\(<]/,
        /^=>\s*[{\[]/,
        /^[{}();]\s*$/,
        // HTML patterns - must start with <
        /^<[a-z][\s\S]*?>/i,
        // CSS patterns - must start with selector
        /^[.#][\w-]+\s*{/,
        /^@(media|keyframes|import|font-face)/i,
        // Common code indicators - must be at start of line or after whitespace
        /^\s*console\.(log|error|warn|info)/,
        /^\s*document\.(getElementById|querySelector|addEventListener)/,
        /^\s*window\.(location|history|localStorage|sessionStorage)/,
        /^\s*navigator\.(userAgent|share|geolocation)/,
        /^\s*fetch\(|^\s*XMLHttpRequest|^\s*axios\./,
        /^\s*import\s+.*\s+from\s+['"]/,
        /^\s*require\(['"]/,
        /^\s*\.then\(|^\s*\.catch\(|^\s*\.finally\(/,
        /^\s*Promise\.(resolve|reject|all|race)/,
        /^\s*setTimeout\(|^\s*setInterval\(/,
        /^\s*addEventListener\(|^\s*removeEventListener\(/,
        /^\s*\.map\(|^\s*\.filter\(|^\s*\.reduce\(|^\s*\.forEach\(/,
        /^\s*JSON\.(parse|stringify)/,
        /^\s*localStorage\.(getItem|setItem|removeItem)/,
        /^\s*sessionStorage\.(getItem|setItem|removeItem)/,
    ];

    // Check if content contains code patterns
    const hasCodePatterns = codePatterns.some(pattern => pattern.test(content));
    
    // More sophisticated check: analyze the structure of the content
    const lines = content.split('\n');
    const codeLines = lines.filter(line => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        return codePatterns.some(pattern => pattern.test(line));
    });
    
    // Check if this looks like natural language (bot response) vs actual code
    const hasNaturalLanguageStart = /^(This|The|Here|In|When|You|We|It|They|This code|This function|This method|This is|Here's|The code|The function)/i.test(content);
    const hasExplanatoryWords = /(explains?|shows?|demonstrates?|checks?|uses?|calls?|returns?|handles?|provides?|creates?|implements?)/i.test(content);
    const hasCodeReferences = /`[^`]+`/.test(content); // backticks around code references
    
    // If it has natural language indicators AND code references (like `navigator.share`), treat as text
    const isNaturalLanguageWithCodeRefs = (hasNaturalLanguageStart || hasExplanatoryWords) && hasCodeReferences;
    
    // If it has significant code patterns and doesn't look like natural language, treat as code
    if (hasCodePatterns && !isNaturalLanguageWithCodeRefs && codeLines.length > 0) {
        // Enhanced approach: better handling of multiple code blocks
        const lines = content.split('\n');
        const segments: Array<{ type: 'text' | 'code'; content: string }> = [];
        let currentSegment: { type: 'text' | 'code'; content: string } | null = null;
        let inCodeBlock = false;
        let consecutiveTextLines = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // Skip empty lines but preserve them
            if (!trimmedLine) {
                if (currentSegment) {
                    currentSegment.content += line + '\n';
                }
                continue;
            }

            // Check if this line looks like code
            const isCodeLine = codePatterns.some(pattern => pattern.test(line));
            
            // Check if this is a comment (starts with // or /* or *)
            const isComment = /^\s*(\/\/|\/\*|\*\/|\*)/.test(line);
            
            // Check if this looks like a natural language explanation (very strict)
            const isNaturalLanguage = /^(This|The|Here|In|When|You|We|It|They|This code|This function|This method|This is|Here's|The code|The function|For example|For instance|Such as|Like|Including|You can|We can|It can|They can)/i.test(trimmedLine) ||
                /^(explains?|shows?|demonstrates?|checks?|uses?|calls?|returns?|handles?|provides?|creates?|implements?|allows?|enables?|supports?)/i.test(trimmedLine);
            
            // Check if this looks like code continuation (variables, operators, etc.)
            const looksLikeCodeContinuation = /^[a-zA-Z_$][a-zA-Z0-9_$]*\s*[=:;{}()[\],]/i.test(trimmedLine) ||
                /^\s*[=:;{}()[\],]/i.test(trimmedLine) ||
                /^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*[=:;{}()[\],]/i.test(trimmedLine);
            
            if (isCodeLine || isComment || looksLikeCodeContinuation) {
                // This is code, comment, or code continuation
                consecutiveTextLines = 0; // Reset text line counter
                
                if (!inCodeBlock) {
                    // Starting a new code block
                    if (currentSegment) {
                        segments.push(currentSegment);
                    }
                    currentSegment = { type: 'code', content: line + '\n' };
                    inCodeBlock = true;
                } else {
                    // Continue existing code block
                    if (currentSegment) {
                        currentSegment.content += line + '\n';
                    }
                }
            } else {
                // This is text
                consecutiveTextLines++;
                
                if (inCodeBlock) {
                    // Only break out of code block for very clear natural language OR multiple consecutive text lines
                    if ((isNaturalLanguage && trimmedLine.length > 20) || consecutiveTextLines >= 2) {
                        // End the code block and start text
                        if (currentSegment) {
                            segments.push(currentSegment);
                        }
                        currentSegment = { type: 'text', content: line + '\n' };
                        inCodeBlock = false;
                    } else {
                        // Keep it in the code block (might be a comment or continuation)
                        if (currentSegment) {
                            currentSegment.content += line + '\n';
                        }
                    }
                } else {
                    // Continue or start text segment
                    if (currentSegment?.type === 'text') {
                        currentSegment.content += line + '\n';
                    } else {
                        // Start new text segment
                        if (currentSegment) {
                            segments.push(currentSegment);
                        }
                        currentSegment = { type: 'text', content: line + '\n' };
                    }
                }
            }
        }

        // Add the last segment
        if (currentSegment) {
            segments.push(currentSegment);
        }

        // Clean up segments and merge adjacent segments of the same type
        const cleanedSegments: Array<{ type: 'text' | 'code'; content: string }> = [];
        for (const segment of segments) {
            const content = segment.content.trim();
            if (!content) continue;
            
            if (cleanedSegments.length > 0 && cleanedSegments[cleanedSegments.length - 1].type === segment.type) {
                // Merge with previous segment of same type
                cleanedSegments[cleanedSegments.length - 1].content += '\n' + content;
            } else {
                cleanedSegments.push({ type: segment.type, content });
            }
        }

        // Render segments - handle both mixed content and pure code
        const hasCodeSegments = cleanedSegments.some(s => s.type === 'code');
        
        if (hasCodeSegments) {
            return (
                <>
                    {cleanedSegments.map((segment, index) => {
                        const content = segment.content.trim();
                        if (!content) return null;
                        
                        return segment.type === 'code' ? (
                            <CodeBlock key={index} code={content} />
                        ) : (
                            <ReactMarkdown key={index}>{content}</ReactMarkdown>
                        );
                    })}
                </>
            );
        }
    }

    // If no code patterns detected, render as plain text
    return <ReactMarkdown>{content}</ReactMarkdown>;
};


export function ChatMessage({ role, content }: ChatMessageProps) {
  const isModel = role === 'model';
  return (
    <div
      className={cn(
        'flex items-start gap-3',
        !isModel && 'justify-end'
      )}
    >
      {isModel && (
        <Avatar className="h-8 w-8 border avatar-shadow">
          <AvatarFallback><Bot size={16} /></AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-sm rounded-2xl px-4 py-2.5 md:max-w-md',
          'shadow-[rgba(50,50,93,0.25)_0px_2px_5px_-1px,rgba(0,0,0,0.3)_0px_1px_3px_-1px]',
          isModel
            ? 'bg-primary/10 text-foreground rounded-tl-none'
            : 'bg-card text-card-foreground rounded-tr-none'
        )}
      >
        <div className="prose prose-sm max-w-none prose-p:my-0 prose-headings:my-2 prose-ul:my-2 prose-li:my-0">
           {renderContent(content)}
        </div>
      </div>
      {!isModel && (
        <Avatar className="h-8 w-8 border avatar-shadow">
          <AvatarFallback><User size={16}/></AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
