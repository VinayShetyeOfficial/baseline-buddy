'use client';

import React, { useState } from 'react';
import { ChatMessage } from './chat-message';
import { SmartChatMessage } from './smart-chat-message';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const DEMO_CONTENT = `EXPLAIN ME:

if (navigator.share) {
  navigator.share({
    title: 'Hello World',
    text: 'Check it out!',
    url: window.location.href
  }).catch(error => {
    console.error('Error sharing:', error);
  });
} else {
  // Fallback for browsers that do not support Web Share API
  navigator.clipboard.writeText(window.location.href)
    .then(() => {
      alert('URL copied to clipboard!');
    })
    .catch(err => {
      alert('Failed to copy URL to clipboard');
    });
}`;

export function ChatComparison() {
  const [content, setContent] = useState(DEMO_CONTENT);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chat Message Rendering Comparison</CardTitle>
          <CardDescription>
            Compare the old vs new chat message rendering approaches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Content:</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your text and code combination here..."
              rows={8}
            />
            <Button 
              onClick={() => setContent(DEMO_CONTENT)}
              variant="outline"
              size="sm"
            >
              Reset to Demo Content
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Old Implementation</CardTitle>
            <CardDescription>
              Current chat message component (has issues with mixed content)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ChatMessage 
                role="model" 
                content={content} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">New Smart Implementation</CardTitle>
            <CardDescription>
              Smart chat message component (properly separates text and code)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SmartChatMessage 
                role="model" 
                content={content} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Improvements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">Old Issues:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Mixed content rendered as plain text</li>
                <li>• Code blocks not properly detected</li>
                <li>• Whitespace not preserved</li>
                <li>• Complex parsing logic with bugs</li>
                <li>• Inconsistent behavior</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-2">New Solutions:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Perfect text/code separation</li>
                <li>• Enhanced code detection patterns</li>
                <li>• Whitespace preservation with pre-wrap</li>
                <li>• Simple, reliable parsing logic</li>
                <li>• Consistent behavior across all scenarios</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
