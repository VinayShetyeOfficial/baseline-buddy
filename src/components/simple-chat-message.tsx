'use client';

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { js_beautify } from 'js-beautify';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { githubDark } from '@uiw/codemirror-theme-github';

export interface SimpleChatMessageProps {
  role: 'user' | 'model' | 'system';
  content: React.ReactNode;
}

const SimpleCodeBlock = ({ code }: { code: string }) => {
  const cleanCode = code.trim();
  
  let beautifiedCode = cleanCode;
  try {
    beautifiedCode = js_beautify(cleanCode, {
      indent_size: 2,
      space_in_empty_paren: true,
      preserve_newlines: true,
      max_preserve_newlines: 2,
    });
  } catch (e) {
    beautifiedCode = cleanCode;
  }

  return (
    <div className="rounded-md border border-border shadow-sm bg-[#0f172b] my-3 overflow-hidden">
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

// Very simple and reliable content processing
const processSimpleContent = (content: string) => {
  if (typeof content !== 'string') {
    return { type: 'text', content: String(content) };
  }

  const trimmed = content.trim();
  
  // Simple patterns for pure text (very conservative)
  const pureTextPatterns = [
    /^(hello|hi|hey|hye|how are you|what's up|good morning|good afternoon|good evening)[\s\S]*$/i,
    /^(explain|describe|tell me|show me|help|please|thanks|thank you)[\s\S]*$/i,
    /^(what|how|why|when|where|which|who)[\s\S]*\?$/i,
    /^(this is|this code|this function|here is|here's)[\s\S]*$/i,
    /^(ok|okay|yes|no|sure|alright|got it|understood)[\s\S]*$/i,
  ];

  // If it matches pure text patterns and is short, treat as text
  if (trimmed.length < 200 && pureTextPatterns.some(pattern => pattern.test(trimmed))) {
    return { type: 'text', content };
  }

  // Simple patterns for definite code (very specific)
  const definiteCodePatterns = [
    /^(const|let|var|function|class|interface|type|enum)\s+\w+/m,
    /^(if|else|for|while|switch|try|catch|async|await)\s*[\(\{]/m,
    /^\s*console\./m,
    /^\s*document\./m,
    /^\s*window\./m,
    /^\s*navigator\./m,
    /^<[a-z][^>]*>/im,
    /^[.#][\w-]+\s*\{/m,
    /[{}();]\s*$/m,
  ];

  // Check if it has definite code patterns
  const hasCode = definiteCodePatterns.some(pattern => pattern.test(content));
  
  if (!hasCode) {
    return { type: 'text', content };
  }

  // For mixed content, try to separate text and code
  const lines = content.split('\n');
  const segments: Array<{ type: 'text' | 'code'; content: string }> = [];
  let currentSegment: { type: 'text' | 'code'; content: string } | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Empty lines go to current segment
    if (!trimmedLine) {
      if (currentSegment) {
        currentSegment.content += line + '\n';
      }
      continue;
    }

    const isCodeLine = definiteCodePatterns.some(pattern => pattern.test(line));
    const isTextLine = pureTextPatterns.some(pattern => pattern.test(trimmedLine)) ||
                      /^(this|the|here|and|but|so|also|what|how|why)[\s\w]*$/i.test(trimmedLine);

    const segmentType = isCodeLine ? 'code' : 'text';
    
    if (currentSegment?.type === segmentType) {
      // Continue current segment
      currentSegment.content += line + '\n';
    } else {
      // Start new segment
      if (currentSegment) {
        segments.push(currentSegment);
      }
      currentSegment = { type: segmentType, content: line + '\n' };
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return { type: 'mixed', segments };
};

const renderSimpleContent = (content: any) => {
  if (typeof content !== 'string') {
    return <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>;
  }

  const processed = processSimpleContent(content);

  if (processed.type === 'text') {
    return <div style={{ whiteSpace: 'pre-wrap' }}>{processed.content}</div>;
  }

  if (processed.type === 'mixed' && processed.segments) {
    return (
      <>
        {processed.segments.map((segment, index) => {
          const segmentContent = segment.content.trim();
          if (!segmentContent) return null;
          
          if (segment.type === 'code') {
            return <SimpleCodeBlock key={index} code={segmentContent} />;
          } else {
            return (
              <div key={index} style={{ whiteSpace: 'pre-wrap' }} className="mb-2">
                {segmentContent}
              </div>
            );
          }
        })}
      </>
    );
  }

  // Fallback to text
  return <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>;
};

export function SimpleChatMessage({ role, content }: SimpleChatMessageProps) {
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
          {renderSimpleContent(content)}
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
