'use client';

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { js_beautify } from 'js-beautify';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { githubDark } from '@uiw/codemirror-theme-github';
import hljs from 'highlight.js/lib/core';

// Import common languages for highlight.js
import javascript_hljs from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import json from 'highlight.js/lib/languages/json';

// Register languages with highlight.js
hljs.registerLanguage('javascript', javascript_hljs);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('html', html);
hljs.registerLanguage('css', css);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('json', json);

export interface IntelligentChatMessageProps {
  role: 'user' | 'model' | 'system';
  content: React.ReactNode;
}

const IntelligentCodeBlock = ({ code }: { code: string }) => {
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

// Use highlight.js to intelligently detect if content is code
const detectCodeWithHighlightJS = (content: string): { isCode: boolean; language?: string; confidence: number } => {
  try {
    // Use highlight.js automatic detection
    const result = hljs.highlightAuto(content);
    
    // Highlight.js returns a relevance score (higher = more likely to be code)
    // Typical scores: 0-10 (text), 10+ (possible code), 20+ (likely code), 50+ (definitely code)
    const isCode = result.relevance > 15; // Adjust threshold as needed
    
    return {
      isCode,
      language: result.language,
      confidence: result.relevance
    };
  } catch (error) {
    // Fallback if highlight.js fails
    return { isCode: false, confidence: 0 };
  }
};

// Enhanced content processing using highlight.js
const processIntelligentContent = (content: string) => {
  if (typeof content !== 'string') {
    return { type: 'text', content: String(content) };
  }

  const trimmed = content.trim();
  
  // Quick check for very obvious text patterns (override highlight.js for these)
  const obviousTextPatterns = [
    /^(hello|hi|hey|hye|how are you|what's up|good morning|good afternoon|good evening)$/i,
    /^(explain|describe|tell me|show me|help|please|thanks|thank you)$/i,
    /^(what|how|why|when|where|which|who)[\s\w]*\?$/i,
    /^(ok|okay|yes|no|sure|alright|got it|understood)$/i,
  ];

  // If it matches obvious text patterns and is short, treat as text
  if (trimmed.length < 100 && obviousTextPatterns.some(pattern => pattern.test(trimmed))) {
    return { type: 'text', content };
  }

  // Use highlight.js to detect if the entire content is code
  const detection = detectCodeWithHighlightJS(content);
  
  if (detection.isCode && detection.confidence > 20) {
    return { 
      type: 'code', 
      content, 
      language: detection.language,
      confidence: detection.confidence 
    };
  }

  // For mixed content, analyze line by line
  const lines = content.split('\n');
  if (lines.length === 1) {
    // Single line - if not detected as code, treat as text
    return { type: 'text', content };
  }

  // Multi-line content: analyze each line and group
  const segments: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  let currentSegment: { type: 'text' | 'code'; content: string; language?: string } | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Empty lines go to current segment
    if (!trimmedLine) {
      if (currentSegment) {
        currentSegment.content += line + '\n';
      }
      continue;
    }

    // Check if this line is code using highlight.js
    const lineDetection = detectCodeWithHighlightJS(trimmedLine);
    const isCodeLine = lineDetection.isCode && lineDetection.confidence > 10;
    
    // Also check for obvious text patterns
    const isObviousText = obviousTextPatterns.some(pattern => pattern.test(trimmedLine)) ||
                         /^(this|the|here|and|but|so|also|however|therefore|my purpose is)[\s\w]*$/i.test(trimmedLine);

    const segmentType = (isCodeLine && !isObviousText) ? 'code' : 'text';
    
    if (currentSegment?.type === segmentType) {
      // Continue current segment
      currentSegment.content += line + '\n';
    } else {
      // Start new segment
      if (currentSegment) {
        segments.push(currentSegment);
      }
      currentSegment = { 
        type: segmentType, 
        content: line + '\n',
        language: segmentType === 'code' ? lineDetection.language : undefined
      };
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  // If we only have one segment, return it directly
  if (segments.length === 1) {
    const segment = segments[0];
    return {
      type: segment.type,
      content: segment.content.trim(),
      language: segment.language
    };
  }

  // Multiple segments - return as mixed
  return { type: 'mixed', segments };
};

const renderIntelligentContent = (content: any) => {
  if (typeof content !== 'string') {
    return <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>;
  }

  const processed = processIntelligentContent(content);

  if (processed.type === 'text') {
    return <div style={{ whiteSpace: 'pre-wrap' }}>{processed.content}</div>;
  }

  if (processed.type === 'code') {
    return <IntelligentCodeBlock code={processed.content} />;
  }

  if (processed.type === 'mixed' && processed.segments) {
    return (
      <>
        {processed.segments.map((segment, index) => {
          const segmentContent = segment.content.trim();
          if (!segmentContent) return null;
          
          if (segment.type === 'code') {
            return <IntelligentCodeBlock key={index} code={segmentContent} />;
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

export function IntelligentChatMessage({ role, content }: IntelligentChatMessageProps) {
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
          {renderIntelligentContent(content)}
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
