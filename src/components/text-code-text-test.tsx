'use client';

import React, { useState } from 'react';
import { SmartChatMessage } from './smart-chat-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const TEXT_CODE_TEXT_CASES = [
  {
    name: "Your Exact Issue",
    content: `Explain

if (navigator.share) {
  navigator.share({
    title: 'Hello World'
  });
} else {
  // Fallback for browsers that do not support the Web Share API
  // Consider implementing a custom sharing mechanism
  // 1. Copying the URL to the clipboard:
  navigator.clipboard.writeText(window.location.href)
    .then(() => alert('Link copied to clipboard!'))
    .catch(err => console.error('Failed to copy: ', err));
  // 2. Opening a specific social media share link
  // 3. Displaying a message to the user that sharing
}

what is the code ?`
  },
  {
    name: "Simple Text-Code-Text",
    content: `Here's a function:

function greet(name) {
  return 'Hello ' + name;
}

What does this do?`
  },
  {
    name: "Multiple Questions",
    content: `First example:

const arr = [1, 2, 3];

How does this work?

const result = arr.map(x => x * 2);

What is the output?`
  },
  {
    name: "Short Text Segments",
    content: `Start

let x = 5;
let y = 10;
console.log(x + y);

End

function test() {
  return true;
}

Done`
  },
  {
    name: "Questions and Code",
    content: `What is this?

const data = await fetch('/api');

How to use it?

const result = await data.json();
console.log(result);

Why do we need this?`
  }
];

export function TextCodeTextTest() {
  const [selectedTest, setSelectedTest] = useState(0);
  const [customContent, setCustomContent] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const currentContent = useCustom ? customContent : TEXT_CODE_TEXT_CASES[selectedTest]?.content || '';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Text-Code-Text Pattern Test</CardTitle>
          <CardDescription>
            Test the enhanced parsing for text-code-text combinations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {TEXT_CODE_TEXT_CASES.map((test, index) => (
              <Button
                key={index}
                variant={selectedTest === index && !useCustom ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedTest(index);
                  setUseCustom(false);
                }}
              >
                {test.name}
              </Button>
            ))}
            <Button
              variant={useCustom ? "default" : "outline"}
              size="sm"
              onClick={() => setUseCustom(true)}
            >
              Custom Test
            </Button>
          </div>

          {useCustom && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Content:</label>
              <Textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Enter your text-code-text combination here..."
                rows={8}
              />
            </div>
          )}

          <div className="border rounded-lg p-4 bg-muted/20">
            <h3 className="font-semibold mb-2">Test Content:</h3>
            <pre className="text-sm whitespace-pre-wrap bg-background p-3 rounded border">
              {currentContent}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rendered Output</CardTitle>
          <CardDescription>
            Expected: Text segments as text, code segments in code editors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SmartChatMessage 
              role="model" 
              content={currentContent} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expected Behavior</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Text segments should appear as regular text</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-800 rounded"></div>
              <span>Code segments should appear in dark code editors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Questions like "what is the code?" should be text</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
