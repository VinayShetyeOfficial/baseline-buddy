
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { ReadOnlyCodeEditor } from '@/components/read-only-code-editor';
import { Suggestion } from '@/ai/schemas';
import { cn } from '@/lib/utils';

interface SuggestionCardProps {
  suggestion: Suggestion;
}

type CodeView = 'original' | 'suggested';

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const [activeView, setActiveView] = useState<CodeView>('suggested');

  const codeToShow = activeView === 'original' ? suggestion.originalCode : suggestion.code;
  const filePathToShow = activeView === 'original' ? undefined : suggestion.filePath;

  return (
    <div>
      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-ul:text-foreground mb-2">
        <ReactMarkdown>{suggestion.explanation}</ReactMarkdown>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Button
          variant={activeView === 'original' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('original')}
          className={cn(
             activeView === 'original' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 'border-border'
          )}
        >
          Original Code
        </Button>
        <Button
          variant={activeView === 'suggested' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('suggested')}
           className={cn(
             activeView === 'suggested' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 'border-border'
          )}
        >
          Suggested Code
        </Button>
      </div>

      <div className="h-full rounded-xl border border-border shadow-lg bg-[#0f172b] flex flex-col">
        <ReadOnlyCodeEditor value={codeToShow} filePath={filePathToShow} />
      </div>
    </div>
  );
}
