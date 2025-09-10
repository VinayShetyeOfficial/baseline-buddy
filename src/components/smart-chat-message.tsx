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
    // Remove HTML tags with CSS classes
    .replace(/<[^>]*class="[^"]*"[^>]*>/g, '')
    // Remove closing HTML tags
    .replace(/<\/[^>]*>/g, '')
    // Remove any remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove CSS class name artifacts
    .replace(/\d+">"[^"]*">/g, '')
    // Remove HTML entities
    .replace(/&[a-zA-Z0-9#]+;/g, '')
    // Remove markdown artifacts
    .replace(/```[\w]*\n?/g, '')
    .replace(/```\n?/g, '')
    // Clean up extra whitespace
    .trim();

  const beautifiedCode = js_beautify(cleanCode, {
    indent_size: 2,
    space_in_empty_paren: true,
    preserve_newlines: true,
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
        style={{ 
          fontFamily: '"Source Code Pro", monospace', 
          fontSize: '13px', 
          backgroundColor: '#0f172b' 
        }}
      />
    </div>
  );
};

// Simple and effective code detection patterns
const CODE_START_PATTERNS = [
  // JavaScript/TypeScript
  /^(const|let|var|function|class|interface|type|enum)\s+\w+/,
  /^(if|else|for|while|switch|try|catch|async|await)\s*[\(<]/,
  /^=>\s*[{\[]/,
  /^[{}();]\s*$/,
  /^\s*console\.(log|error|warn|info|debug)/,
  /^\s*document\.(getElementById|querySelector|addEventListener)/,
  /^\s*window\.(location|history|localStorage|sessionStorage)/,
  /^\s*navigator\.(userAgent|share|geolocation|clipboard)/,
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
  /^\s*new\s+(Date|Array|Object|RegExp|Error)/,
  /^\s*\.(length|push|pop|shift|unshift|slice|splice)/,
  
  // HTML
  /^<[a-z][\s\S]*?>/i,
  /^<\/[a-z][\s\S]*?>/i,
  /^<[a-z][^>]*\/>/i,
  /^<!DOCTYPE/i,
  /^<!--[\s\S]*?-->/,
  
  // CSS
  /^[.#][\w-]+\s*{/,
  /^@(media|keyframes|import|font-face|supports)/i,
  /^[a-z-]+\s*:\s*[^;]+;/,
  /^\s*\/\*[\s\S]*?\*\//,
  
  // SQL
  /^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s+/i,
  /^(FROM|WHERE|JOIN|GROUP BY|ORDER BY|HAVING)\s+/i,
  
  // Comments
  /^\s*\/\/.*$/,
  /^\s*\/\*[\s\S]*?\*\//,
  /^\s*#.*$/,
];

// Code continuation patterns
const CODE_CONTINUATION_PATTERNS = [
  /^[a-zA-Z_$][a-zA-Z0-9_$]*\s*[=:;{}()[\],]/,
  /^\s*[=:;{}()[\],]/,
  /^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*[=:;{}()[\],]/,
  /^\s*\.(then|catch|finally|map|filter|reduce|forEach)/,
  /^\s*}\s*else\s*{/,
  /^\s*}\s*catch\s*\(/,
  /^\s*}\s*finally\s*{/,
  /^\s*}\s*while\s*\(/,
  /^\s*}\s*for\s*\(/,
];

// Natural language indicators (very strict)
const NATURAL_LANGUAGE_PATTERNS = [
  /^(This|The|Here|In|When|You|We|It|They|This code|This function|This method|This is|Here's|The code|The function)/i,
  /^(For example|For instance|Such as|Like|Including|You can|We can|It can|They can)/i,
  /^(explains?|shows?|demonstrates?|checks?|uses?|calls?|returns?|handles?|provides?|creates?|implements?|allows?|enables?|supports?)/i,
  /^(Note|Remember|Important|Warning|Tip|Consider|Keep in mind)/i,
  /^(Please|Could you|Can you|Would you|Help me|I need|I want)/i,
];

// Simple and effective parsing function
const parseMixedContent = (content: string) => {
  if (typeof content !== 'string') {
    return [{ type: 'text', content }];
  }

  // First, handle fenced code blocks (```code```)
  const fencedCodeRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  const fencedMatches = [...content.matchAll(fencedCodeRegex)];
  
  if (fencedMatches.length > 0) {
    const parts = content.split(fencedCodeRegex);
    const result: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part && part.trim()) {
        if (i % 3 === 0) {
          // Text content
          result.push({ type: 'text', content: part });
        } else if (i % 3 === 1) {
          // Language specification (skip)
          continue;
        } else {
          // Code content
          const language = parts[i - 1] || 'javascript';
          result.push({ type: 'code', content: part.trim(), language });
        }
      }
    }
    return result;
  }

  // Handle inline code with backticks
  const inlineCodeRegex = /`([^`]+)`/g;
  const inlineMatches = [...content.matchAll(inlineCodeRegex)];
  
  if (inlineMatches.length > 0) {
    const parts = content.split(inlineCodeRegex);
    const result: Array<{ type: 'text' | 'code'; content: string; inline?: boolean }> = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part && part.trim()) {
        if (i % 2 === 0) {
          result.push({ type: 'text', content: part });
        } else {
          result.push({ type: 'code', content: part, inline: true });
        }
      }
    }
    return result;
  }

  // Enhanced unfenced code detection
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
    const isCodeStart = CODE_START_PATTERNS.some(pattern => pattern.test(line));
    const isCodeContinuation = CODE_CONTINUATION_PATTERNS.some(pattern => pattern.test(trimmedLine));
    const isComment = /^\s*(\/\/|\/\*|\*\/|\*|#)/.test(line);
    
    // Check if this looks like natural language (enhanced detection)
    const isNaturalLanguage = NATURAL_LANGUAGE_PATTERNS.some(pattern => pattern.test(trimmedLine));
    
    // Check if this looks like a question or explanatory text
    const isQuestion = /^(what|how|why|when|where|which|who|can|could|would|should|is|are|does|do|did)\s+/i.test(trimmedLine) ||
                      /\?$/.test(trimmedLine);
    
    // Check if this is clearly not code (single words, questions, etc.)
    const isPlainText = trimmedLine.split(/\s+/).length <= 5 && 
                       (isQuestion || isNaturalLanguage || 
                        /^(explain|describe|tell|show|help|please|thanks|thank you|ok|okay|yes|no)$/i.test(trimmedLine));
    
    if (isCodeStart || isCodeContinuation || isComment) {
      // This is code
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
        // More aggressive breaking out of code blocks
        if (isNaturalLanguage || isQuestion || isPlainText || consecutiveTextLines >= 1) {
          // End the code block and start text
          if (currentSegment) {
            segments.push(currentSegment);
          }
          currentSegment = { type: 'text', content: line + '\n' };
          inCodeBlock = false;
          consecutiveTextLines = 0; // Reset counter
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

  // Clean up and merge adjacent segments of the same type
  const cleanedSegments: Array<{ type: 'text' | 'code'; content: string; language?: string; inline?: boolean }> = [];
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

  return cleanedSegments;
};

const renderContent = (content: any) => {
  if (typeof content !== 'string') {
    return content;
  }

  const segments = parseMixedContent(content);
  
  return (
    <>
      {segments.map((segment, index) => {
        const { type, content, language, inline } = segment;
        
        if (!content.trim()) return null;
        
        if (type === 'code') {
          if (inline) {
            return (
              <code 
                key={index} 
                className="bg-muted px-1 py-0.5 rounded text-sm font-mono"
              >
                {content}
              </code>
            );
          }
          return <CodeBlock key={index} code={content} />;
        }
        
        return (
          <div key={index} style={{ whiteSpace: 'pre-wrap' }}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        );
      })}
    </>
  );
};

export function SmartChatMessage({ role, content }: ChatMessageProps) {
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
