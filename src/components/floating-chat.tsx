
'use client';

import { useEffect, useState } from 'react';
import {
  Widget,
  addResponseMessage,
  toggleMsgLoader,
  isWidgetOpened,
  toggleWidget
} from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import { chatWithCode, ChatMessage } from '@/ai/flows/chat-with-code';
import { useToast } from '@/hooks/use-toast';

interface FloatingChatProps {
  analysisContext: {
    code: string;
    analysisReport: string;
    suggestions: string;
    polyfills: string;
  };
}

export function FloatingChat({ analysisContext }: FloatingChatProps) {
  const { toast } = useToast();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!isWidgetOpened()) {
      toggleWidget();
    }
    addResponseMessage("Hi there! I'm Baseline Buddy. Ask me anything about this analysis report.");
  }, []);

  const handleNewUserMessage = async (newMessage: string) => {
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: newMessage }];
    setChatHistory(newHistory);
    toggleMsgLoader();

    try {
      const response = await chatWithCode({
        question: newMessage,
        ...analysisContext,
        history: newHistory.slice(0, -1),
      });
      addResponseMessage(response.answer);
      setChatHistory(prev => [...prev, { role: 'model', content: response.answer }]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      const displayMessage = "Sorry, I encountered an error. Please try again.";
      addResponseMessage(displayMessage);
      toast({
        variant: 'destructive',
        title: 'Chat Error',
        description: `Could not get a response from the AI. ${errorMessage}`,
      });
    } finally {
      toggleMsgLoader();
    }
  };

  return (
    <Widget
      handleNewUserMessage={handleNewUserMessage}
      title="Baseline Buddy"
      subtitle="Ask me about the report"
      senderPlaceHolder="Type your question..."
      showTimeStamp={false}
      showCloseButton={true}
      autofocus={false}
    />
  );
}
