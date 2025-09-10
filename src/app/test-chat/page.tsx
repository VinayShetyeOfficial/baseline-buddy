'use client';

import { SmartChatTester } from '@/components/smart-chat-tester';

export default function TestChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <SmartChatTester />
      </div>
    </div>
  );
}
