
'use client';

import { useEffect, useState } from 'react';
import { chatWithCode, ChatMessage } from '@/ai/flows/chat-with-code';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { X, Send, Bot, Loader2 } from 'lucide-react';
import { DebugChatMessage } from '@/components/debug-chat-message';
import { BouncingDots } from '@/components/bouncing-dots';

interface FloatingChatProps {
  analysisContext?: {
    code: string;
    analysisReport: string;
    suggestions: string;
    polyfills: string;
  };
}

export function FloatingChat({ analysisContext }: FloatingChatProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Add welcome message when component mounts or context changes
    const welcomeMessage = analysisContext 
      ? "Hi there! I'm Baseline Buddy. Ask me anything about this analysis report."
      : "Hi! I'm Baseline Buddy. I can help you with web compatibility questions, code analysis, and browser support. Try analyzing some code first, or ask me anything!";
    
    setChatHistory([{ role: 'model', content: welcomeMessage }]);
  }, [analysisContext]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(newHistory);
    setIsLoading(true);

    try {
      const response = await chatWithCode({
        question: userMessage,
        code: analysisContext?.code || 'No code provided yet. User can ask general questions.',
        analysisReport: analysisContext?.analysisReport || 'No analysis available yet.',
        suggestions: analysisContext?.suggestions || 'No suggestions available yet.',
        polyfills: analysisContext?.polyfills || 'No polyfills available yet.',
        history: newHistory.slice(0, -1),
      });
      
      setChatHistory(prev => [...prev, { role: 'model', content: response.answer }]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      const displayMessage = "Sorry, I encountered an error. Please try again.";
      setChatHistory(prev => [...prev, { role: 'model', content: displayMessage }]);
      
      toast({
        variant: 'destructive',
        title: 'Chat Error',
        description: `Could not get a response from the AI. ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50"
          size="icon"
        >
          <svg className="chat-launcher-icon text-white" viewBox="0 0 122.88 119.35" aria-label="Open chat">
            <path fill="currentColor" d="M57.49,29.2V23.53a14.41,14.41,0,0,1-2-.93A12.18,12.18,0,0,1,50.44,7.5a12.39,12.39,0,0,1,2.64-3.95A12.21,12.21,0,0,1,57,.92,12,12,0,0,1,61.66,0,12.14,12.14,0,0,1,72.88,7.5a12.14,12.14,0,0,1,0,9.27,12.08,12.08,0,0,1-2.64,3.94l-.06.06a12.74,12.74,0,0,1-2.36,1.83,11.26,11.26,0,0,1-2,.93V29.2H94.3a15.47,15.47,0,0,1,15.42,15.43v2.29H115a7.93,7.93,0,0,1,7.9,7.91V73.2A7.93,7.93,0,0,1,115,81.11h-5.25v2.07A15.48,15.48,0,0,1,94.3,98.61H55.23L31.81,118.72a2.58,2.58,0,0,1-3.65-.29,2.63,2.63,0,0,1-.63-1.85l1.25-18h-.21A15.45,15.45,0,0,1,13.16,83.18V81.11H7.91A7.93,7.93,0,0,1,0,73.2V54.83a7.93,7.93,0,0,1,7.9-7.91h5.26v-2.3A15.45,15.45,0,0,1,28.57,29.2H57.49ZM82.74,47.32a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm-42.58,0a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm6.38,31.36a2.28,2.28,0,0,1-.38-.38,2.18,2.18,0,0,1-.52-1.36,2.21,2.21,0,0,1,.46-1.39,2.4,2.4,0,0,1,.39-.39,3.22,3.22,0,0,1,3.88-.08A22.36,22.36,0,0,0,56,78.32a14.86,14.86,0,0,0,5.47,1A16.18,16.18,0,0,0,67,78.22,25.39,25.39,0,0,0,72.75,75a3.24,3.24,0,0,1,3.89.18,3,3,0,0,1,.37.41,2.22,2.22,0,0,1,.42,1.4,2.33,2.33,0,0,1-.58,1.35,2.29,2.29,0,0,1-.43.38,30.59,30.59,0,0,1-7.33,4,22.28,22.28,0,0,1-7.53,1.43A21.22,21.22,0,0,1,54,82.87a27.78,27.78,0,0,1-7.41-4.16l0,0ZM94.29,34.4H28.57A10.26,10.26,0,0,0,18.35,44.63V83.18A10.26,10.26,0,0,0,28.57,93.41h3.17a2.61,2.61,0,0,1,2.41,2.77l-1,14.58L52.45,94.15a2.56,2.56,0,0,1,1.83-.75h40a10.26,10.26,0,0,0,10.22-10.23V44.62A10.24,10.24,0,0,0,94.29,34.4Z"/>
          </svg>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-5 right-5 w-[30rem] h-auto shadow-xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3 bg-primary text-primary-foreground rounded-t-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-primary-foreground/20 p-2">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base leading-none">Baseline Buddy</h3>
                <p className="text-xs opacity-90 mt-0.5">
                  {analysisContext ? "Ask me about the report" : "Web compatibility assistant"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 space-y-6 overflow-y-auto p-4 chat-scrollbar min-h-[28rem] max-h-[28rem]">
              {chatHistory.map((message, index) => (
                <DebugChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                />
              ))}
              {isLoading && (
                <DebugChatMessage role="model" content={<BouncingDots />} />
              )}
            </div>
            
            {/* Input */}
            <div className="border-t bg-background/50 p-4">
              <form
                onSubmit={handleSendMessage}
                className="flex w-full items-center gap-2 rounded-md border p-1.5 pr-2"
              >
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e as any);
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
          </CardContent>
        </Card>
      )}
    </>
  );
}
