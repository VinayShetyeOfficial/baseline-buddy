'use client';

import React from 'react';
import { SmartChatMessage } from './smart-chat-message';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TEST_CONTENT = `This code snippet implements the recommended fallback for the Web Share API (navigator.share). If navigator.share is not available (e.g., in Firefox), it gracefully falls back to copying the current page's URL to the clipboard using navigator.clipboard.writeText, which is widely supported across modern browsers.

EXPLAIN

if (navigator.share) { navigator.share({ title: 'Hello World' }); } else { // Fallback: Copy current page URL to clipboard navigator.clipboard.writeText(window.location.href) .then(() => alert('Link copied to clipboard!')) .catch(err => console.error('Failed to copy: ', err));;}

This code snippet implements a feature detection and fallback mechanism for the Web Share API. If navigator.share is`;

export function QuickTest() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Test - Your Exact Scenario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SmartChatMessage 
              role="model" 
              content={TEST_CONTENT} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
