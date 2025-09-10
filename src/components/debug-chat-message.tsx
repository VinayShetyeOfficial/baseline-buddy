'use client';

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { js_beautify } from 'js-beautify';
// Removed editor imports to render code plainly in the bubble
import hljs from 'highlight.js/lib/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

// Import languages for highlight.js
import javascript_hljs from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';

// Register languages
hljs.registerLanguage('javascript', javascript_hljs);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('html', html);
hljs.registerLanguage('css', css);

export interface DebugChatMessageProps {
  role: 'user' | 'model' | 'system';
  content: React.ReactNode;
}

type DebugSegment = { type: 'text' | 'code'; content: string; language?: string };
type ProcessedResult =
  | { type: 'text'; content: string }
  | { type: 'code'; content: string; language?: string; confidence?: number }
  | { type: 'mixed'; segments: DebugSegment[] };

// Custom text formatter that handles combinations like ~*_code_*~
const parseCustomFormat = (text: string): React.ReactNode => {
  // Handle complex combinations first
  const complexPattern = /([~*_`]{1,4})\s*([^~*_`\s](?:[^~*_`]*[^~*_`\s])?)\s*([~*_`]{1,4})/g;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = complexPattern.exec(text)) !== null) {
    const [fullMatch, openMarkers, content, closeMarkers] = match;
    
    // Add text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Check if markers match (allowing any order)
    const openSet = new Set(openMarkers.split(''));
    const closeSet = new Set(closeMarkers.split(''));
    const setsEqual = openSet.size === closeSet.size && [...openSet].every(x => closeSet.has(x));
    
    if (setsEqual) {
      // Apply formatting based on markers present
      let element: React.ReactNode = content;
      
      if (openMarkers.includes('`')) {
        element = <code style={{ fontFamily: '"Source Code Pro", monospace', backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '3px' }}>{element}</code>;
      }
      if (openMarkers.includes('_')) {
        element = <em>{element}</em>;
      }
      if (openMarkers.includes('*')) {
        element = <strong>{element}</strong>;
      }
      if (openMarkers.includes('~')) {
        element = <span style={{ textDecoration: 'line-through' }}>{element}</span>;
      }
      
      parts.push(element);
    } else {
      // Markers don't match, treat as plain text
      parts.push(fullMatch);
    }
    
    lastIndex = match.index + fullMatch.length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 1 ? <>{parts}</> : parts[0] || text;
};

const MarkdownText = ({ text }: { text: string }) => {
  return (
    <div style={{ whiteSpace: 'pre-wrap' }}>
      {parseCustomFormat(text)}
    </div>
  );
};

const DebugCodeBlock = ({ code }: { code: string }) => {
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
    <div style={{ whiteSpace: 'pre-wrap', fontFamily: '"Source Code Pro", monospace', fontSize: '13px' }}>{beautifiedCode}</div>
  );
};

// Debug version with logging
const debugDetectCode = (content: string): { isCode: boolean; language?: string; confidence: number } => {
  try {
    const result = hljs.highlightAuto(content);
    console.log('🔍 Debug Detection:', {
      content: content.substring(0, 50) + '...',
      language: result.language,
      relevance: result.relevance,
      isCode: result.relevance > 5 // Lower threshold for debugging
    });
    
    return {
      isCode: result.relevance > 5, // Lower threshold
      language: result.language,
      confidence: result.relevance
    };
  } catch (error) {
    console.error('❌ Highlight.js error:', error);
    return { isCode: false, confidence: 0 };
  }
};

const processDebugContent = (content: string): ProcessedResult => {
  if (typeof content !== 'string') {
    return { type: 'text', content: String(content) };
  }

  const trimmed = content.trim();
  console.log('🚀 Processing content:', trimmed.substring(0, 100) + '...');
  
  // Enhanced patterns for obvious text (including bot responses)
  const obviousTextPatterns = [
    /^(hello|hi|hey|hye|how are you|what's up)$/i,
    /^(explain|describe|tell me|show me|help|please|thanks|thank you)$/i,
    /^(what|how|why|when|where|which|who)[\s\w]*\?$/i,
    /^(ok|okay|yes|no|sure|alright|got it|understood)$/i,
    // Bot response patterns (enhanced)
    /^(this|the|here's|here is)[\s\w]*\s+(code|snippet|function|method|example)/i,
    /^(this javascript|this css|this html|this code)/i,
    /performs?\s+(two|three|four|five|\d+)\s+(actions?|steps?|operations?)/i,
    /uses?\s+the\s+(fetch|async|await|promise|callback)/i,
    /^(as|being|since)\s+(an?|the)\s+(ai|assistant|expert)/i,
    // More comprehensive bot response patterns
    /^for\s+[`\w\-:]+,?\s+(there is|there are|it|this)/i,
    /browser\s+compatibility\s+with/i,
    /may not be fully supported/i,
    /however,?\s+the\s+[`\w\-:]+/i,
    /pseudo\s*-?\s*class/i,
    /approach\s+with\s+(a|an|some)/i,
    /javascript\s+snippet/i,
  ];

  // If it's a single line and matches obvious text, treat as text
  const lines = content.split('\n');
  if (lines.length === 1 && obviousTextPatterns.some(pattern => pattern.test(trimmed))) {
    console.log('✅ Detected as obvious text');
    return { type: 'text', content };
  }

  // Test the entire content first, but check for bot response patterns
  const fullDetection = debugDetectCode(content);
  
  // Check if this looks like a bot response (override highlight.js detection)
  const isBotResponse = obviousTextPatterns.some(pattern => pattern.test(trimmed));
  
  // Also check for general explanatory language patterns
  const hasExplanatoryLanguage = /\b(however|therefore|although|because|since|while|whereas|moreover|furthermore|additionally|specifically|particularly|especially|essentially|basically|generally|typically|usually|often|sometimes|rarely|never|always)\b/i.test(content) ||
                                /\b(compatibility|supported|approach|snippet|method|function|feature|property|element|attribute|selector|pseudo|class|browser|version)\b/i.test(content) ||
                                /\bmay not be\b/i.test(content) ||
                                /\bthere is\b.*\bcompatibility\b/i.test(content);

  // Strong signals that code is present in the message
  const containsCodeSignals = /(^|\n)\s*(const|let|var|function|class|if|for|while|switch|return|import|export)\b/m.test(content) ||
                              /(^|\n)\s*[.#][\w-]+\s*\{/m.test(content) || // CSS selectors
                              /<\/?[a-zA-Z][^>]*>/m.test(content) ||        // HTML tags
                              /\bawait\b|=>|;|\{\}|\(\)/m.test(content) ||
                              /(^|\n)\s*(\/\/|\/\*|\*)/m.test(content);  // Comments

  if (fullDetection.isCode && fullDetection.confidence > 10) {
    console.log('✅ Detected as full code block');
    return { 
      type: 'code', 
      content, 
      language: fullDetection.language,
      confidence: fullDetection.confidence 
    };
  }
  
  if ((isBotResponse || hasExplanatoryLanguage) && !containsCodeSignals) {
    console.log('✅ Override: Detected as explanatory text');
    return { type: 'text', content };
  }

  // For mixed content, be more aggressive about code detection
  const segments: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  let currentSegment: { type: 'text' | 'code'; content: string; language?: string } | null = null;
  // Track multi-line comment blocks so we don't split code when comments span lines
  let inBlockComment = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      if (!currentSegment) {
        currentSegment = { type: 'text', content: '', language: undefined };
      }
      currentSegment.content += line + '\n';
      continue;
    }

    // If we're currently inside a multi-line comment block, keep appending as code
    if (inBlockComment) {
      const segmentTypeInside = 'code';
      if (currentSegment?.type === segmentTypeInside) {
        currentSegment.content += line + '\n';
      } else {
        if (currentSegment) segments.push(currentSegment);
        currentSegment = { type: segmentTypeInside, content: line + '\n', language: undefined };
      }
      // Detect the end of block comments: */ for CSS/JS or --> for HTML
      if (/\*\//.test(trimmedLine) || /-->/.test(trimmedLine)) {
        inBlockComment = false;
      }
      continue;
    }

    // Test each line
    const lineDetection = debugDetectCode(trimmedLine);
    const isObviousText = obviousTextPatterns.some(pattern => pattern.test(trimmedLine));
    
    // Check if this line is a code comment (single-line) or starts a block comment
    const startsCssJsBlock = /\/\*/.test(trimmedLine) && !/\*\//.test(trimmedLine);
    const startsHtmlBlock = /<!--/.test(trimmedLine) && !/-->/.test(trimmedLine);
    const isSingleLineBlock = /\/\*.*\*\//.test(trimmedLine) || /<!--.*-->/.test(trimmedLine);
    // Treat leading '*' as a comment only when inside a block comment
    const isLineComment = /^\s*(\/\/|#)/.test(trimmedLine) || (inBlockComment && /^\s*\*/.test(trimmedLine));
    const isCodeComment = startsCssJsBlock || startsHtmlBlock || isSingleLineBlock || isLineComment;
    // If a block comment starts and does not close on the same line, enter block-comment mode
    if (startsCssJsBlock || startsHtmlBlock) {
      if (!/\*\//.test(trimmedLine) && !/-->/.test(trimmedLine)) {
        inBlockComment = true;
      }
    }
    
    // More aggressive code detection (including comments that are part of code)
    const isCodeLine = (lineDetection.isCode && lineDetection.confidence > 3) || 
                      isCodeComment ||
                      /^(const|let|var|function|class|if|for|while|switch)\s+/.test(trimmedLine) ||
                      /^[.#][\w-]+\s*\{/.test(trimmedLine) ||
                      /^\s*(display|container-type|grid|background|border|color):\s*/.test(trimmedLine) ||
                      /[{}();]\s*$/.test(trimmedLine) ||
                      /^\s*[}\]]\s*$/.test(trimmedLine) ||
                      /=\s*(await\s+)?[\w.]+\(/.test(trimmedLine);

    // Always treat comment lines as code, even if they look like natural language
    const segmentType = isCodeComment ? 'code' : ((isCodeLine && !isObviousText) ? 'code' : 'text');
    
    console.log(`📝 Line: "${trimmedLine.substring(0, 30)}" -> ${segmentType} (confidence: ${lineDetection.confidence})`);
    
    if (currentSegment?.type === segmentType) {
      currentSegment.content += line + '\n';
    } else {
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

  console.log('📊 Final segments:', segments.map(s => ({ type: s.type, lines: s.content.split('\n').length })));

  if (segments.length === 1) {
    const segment = segments[0];
    return {
      type: segment.type,
      content: segment.content,
      language: segment.language
    };
  }

  return { type: 'mixed', segments };
};

const renderDebugContent = (content: any) => {
  if (typeof content !== 'string') {
    return <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>;
  }

  const processed = processDebugContent(content);

  if (processed.type === 'text') {
    return <MarkdownText text={processed.content} />;
  }

  if (processed.type === 'code') {
    return <DebugCodeBlock code={processed.content} />;
  }

  if (processed.type === 'mixed' && processed.segments) {
    return (
      <>
        {processed.segments.map((segment, index) => {
          const segmentContent = segment.content;
          if (!segmentContent) return null;
          
          if (segment.type === 'code') {
            return <DebugCodeBlock key={index} code={segmentContent} />;
          } else {
            return <MarkdownText key={index} text={segmentContent} />;
          }
        })}
      </>
    );
  }

  return <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>;
};

export function DebugChatMessage({ role, content }: DebugChatMessageProps) {
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
          {renderDebugContent(content)}
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
