'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
}

export function CodeBlock({ code, className, ...props }: CodeBlockProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setHasCopied(true);
    toast({
      title: 'Copied to clipboard!',
    });
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <div className={cn('relative', className)} {...props}>
      <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto font-code">
        <code>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={onCopy}
        aria-label="Copy code"
      >
        {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}
