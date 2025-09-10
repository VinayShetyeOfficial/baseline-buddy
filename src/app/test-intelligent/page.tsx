'use client';

import { IntelligentChatTester } from '@/components/intelligent-chat-tester';

export default function TestIntelligentPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <IntelligentChatTester />
      </div>
    </div>
  );
}
