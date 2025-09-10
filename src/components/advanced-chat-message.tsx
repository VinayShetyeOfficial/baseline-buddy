'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { js_beautify } from 'js-beautify';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { sql } from '@codemirror/lang-sql';
import { githubDark } from '@uiw/codemirror-theme-github';
import remarkGfm from 'remark-gfm';

export interface AdvancedChatMessageProps {
  role: 'user' | 'model' | 'system';
  content: React.ReactNode;
}

// Language detection for CodeMirror extensions
const getLanguageExtension = (language: string) => {
  switch (language.toLowerCase()) {
    case 'html':
    case 'htm':
      return html();
    case 'css':
      return css();
    case 'sql':
      return sql();
    case 'javascript':
    case 'js':
    case 'typescript':
    case 'ts':
    case 'jsx':
    case 'tsx':
    default:
      return javascript({ jsx: true, typescript: true });
  }
};

// Enhanced code block component with better language detection
const AdvancedCodeBlock = ({ children, className, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'javascript';
  
  // Clean and beautify the code
  const code = String(children).replace(/\n$/, '');
  const cleanCode = code
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove HTML entities
    .trim();

  let beautifiedCode = cleanCode;
  
  // Only beautify JavaScript-like languages
  if (['javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(language)) {
    try {
      beautifiedCode = js_beautify(cleanCode, {
        indent_size: 2,
        space_in_empty_paren: true,
        preserve_newlines: true,
        max_preserve_newlines: 2,
      });
    } catch (e) {
      // If beautification fails, use original code
      beautifiedCode = cleanCode;
    }
  }

  return (
    <div className="rounded-md border border-border shadow-sm bg-[#0f172b] my-3 overflow-hidden">
      <CodeMirror
        value={beautifiedCode}
        extensions={[getLanguageExtension(language)]}
        theme={githubDark}
        readOnly={true}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: false,
          autocompletion: false,
          searchKeymap: false,
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

// Inline code component
const InlineCode = ({ children, ...props }: any) => (
  <code 
    className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono border" 
    {...props}
  >
    {children}
  </code>
);

// Simplified content processor that avoids over-processing
const processContent = (content: any): string => {
  if (typeof content !== 'string') {
    return String(content);
  }

  // Simple check: if content already has fenced code blocks, use as-is
  if (content.includes('```')) {
    return content;
  }

  // Simple check: if it's clearly just natural language, return as-is
  const simpleTextPatterns = [
    /^(hello|hi|hey|hye|how are you|what|explain|describe|tell me|thanks|thank you)$/i,
    /^[a-zA-Z\s\?!\.]{1,100}$/,  // Simple text with basic punctuation
  ];

  const trimmedContent = content.trim();
  const lines = trimmedContent.split('\n').filter(line => line.trim().length > 0);
  
  // If it's a single line of simple text, return as-is
  if (lines.length === 1 && simpleTextPatterns.some(pattern => pattern.test(trimmedContent))) {
    return content;
  }

  // More conservative code detection - only fence if we're very sure it's code
  const definiteCodePatterns = [
    /^(const|let|var|function|class|interface)\s+\w+/,
    /^(if|else|for|while|switch|try|catch)\s*\(/,
    /^\s*console\./,
    /^\s*document\./,
    /^\s*window\./,
    /^<[a-z][^>]*>/i,  // HTML tags
    /^[.#][\w-]+\s*\{/,  // CSS selectors
    /[{}();]\s*$/,  // Code syntax endings
  ];

  // Check if we have clear code blocks that need fencing
  let hasCodeBlocks = false;
  const processedLines: string[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isDefiniteCode = definiteCodePatterns.some(pattern => pattern.test(line));
    
    // Very simple natural language detection
    const isSimpleText = simpleTextPatterns.some(pattern => pattern.test(line)) ||
                        /^(this|the|here|and|but|so|also|however|therefore)[\s\w]*$/i.test(line);

    if (isDefiniteCode && !isSimpleText) {
      hasCodeBlocks = true;
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLines = [line];
      } else {
        codeBlockLines.push(line);
      }
    } else {
      if (inCodeBlock) {
        // End code block
        processedLines.push('```javascript');
        processedLines.push(...codeBlockLines);
        processedLines.push('```');
        processedLines.push('');
        inCodeBlock = false;
        codeBlockLines = [];
      }
      processedLines.push(line);
    }
  }

  // Handle remaining code block
  if (inCodeBlock && codeBlockLines.length > 0) {
    processedLines.push('```javascript');
    processedLines.push(...codeBlockLines);
    processedLines.push('```');
  }

  // If we didn't find any code blocks to fence, return original content
  if (!hasCodeBlocks) {
    return content;
  }

  return processedLines.join('\n');
};

const renderContent = (content: any) => {
  if (typeof content !== 'string') {
    return content;
  }

  const processedContent = processContent(content);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: ({ node, className, children, ...props }: any) => {
          const isInline = !className;
          if (isInline) {
            return <InlineCode {...props}>{children}</InlineCode>;
          }
          return <AdvancedCodeBlock className={className} {...props}>{children}</AdvancedCodeBlock>;
        },
        p: ({ children }) => (
          <div className="mb-2 last:mb-0" style={{ whiteSpace: 'pre-wrap' }}>
            {children}
          </div>
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export function AdvancedChatMessage({ role, content }: AdvancedChatMessageProps) {
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
