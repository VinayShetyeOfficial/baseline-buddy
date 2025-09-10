
'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

export interface ChatMessageProps {
  role: 'user' | 'model' | 'system';
  content: React.ReactNode;
}

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
          {typeof content === 'string' ? <ReactMarkdown>{content}</ReactMarkdown> : content}
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
