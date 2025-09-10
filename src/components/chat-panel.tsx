
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/ai/flows/chat-with-code';
import { DebugChatMessage } from './debug-chat-message';
import { BouncingDots } from './bouncing-dots';

interface ChatPanelProps {
  onSubmit: (message: string, history: ChatMessageType[]) => Promise<ChatMessageType>;
}

export function ChatPanel({ onSubmit }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessageType = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const response = await onSubmit(input, newMessages.slice(0, -1));
    setMessages(prev => [...prev, response]);
    setIsLoading(false);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare size={22} /> Chat with your Code
        </CardTitle>
        <CardDescription>Ask follow-up questions about the analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-[32rem] flex-col rounded-lg border bg-muted/20">
          <div
            ref={scrollAreaRef}
            className="flex-1 space-y-6 overflow-y-auto p-4 chat-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <MessageSquare className="mb-2 h-10 w-10" />
                <p className="text-sm font-medium">No messages yet.</p>
                <p className="text-xs">
                  Ask a question like, "Which of these suggestions is most important?"
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <DebugChatMessage key={i} role={msg.role} content={msg.content} />
              ))
            )}
            {isLoading && (
               <DebugChatMessage role="model" content={<BouncingDots />} />
            )}
          </div>
          <div className="border-t bg-background/50 p-4">
            <form
              onSubmit={handleSubmit}
              className="flex w-full items-center gap-2 rounded-md border p-1.5 pr-2"
            >
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                placeholder="Ask a follow-up question..."
                className="flex-1 resize-none border-0 bg-transparent shadow-none chat-textarea chat-input-textarea"
                rows={1}
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                size="icon"
                className="h-full aspect-square shrink-0 rounded-md"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
