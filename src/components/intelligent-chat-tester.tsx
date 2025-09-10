'use client';

import React, { useState } from 'react';
import { IntelligentChatMessage } from './intelligent-chat-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const INTELLIGENT_TEST_CASES = [
  {
    name: "Simple Greeting",
    content: `How are you?`,
    expected: "Text"
  },
  {
    name: "Single Word Command", 
    content: `Explain:`,
    expected: "Text"
  },
  {
    name: "Question About Code",
    content: `What is this code?`,
    expected: "Text"
  },
  {
    name: "Variable Declaration",
    content: `const newArray = [...originalArray];
newArray[2] = 6;`,
    expected: "Code Editor"
  },
  {
    name: "Function with Variables",
    content: `if (navigator.share) {
  navigator.share({
    title: 'Hello World'
  });
}`,
    expected: "Code Editor"
  },
  {
    name: "Mixed Text and Code",
    content: `What is this code?

if (navigator.share) {
  navigator.share({
    title: 'Hello World'
  });
}

EXPLAIN:`,
    expected: "Text + Code + Text"
  },
  {
    name: "Bot Response with Code References",
    content: `My purpose is to assist with web development and code analysis. How can I help you with your questions today?`,
    expected: "Text"
  },
  {
    name: "HTML Code",
    content: `<div class="container">
  <h1>Welcome</h1>
  <button id="myButton">Click me</button>
</div>`,
    expected: "Code Editor"
  },
  {
    name: "CSS Code",
    content: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
}`,
    expected: "Code Editor"
  },
  {
    name: "Complex Mixed Content",
    content: `Here's the solution:

const data = await fetch('/api/data');
const result = await data.json();

This fetches data from the API.

console.log(result);

Hope this helps!`,
    expected: "Text + Code + Text + Code + Text"
  }
];

export function IntelligentChatTester() {
  const [selectedTest, setSelectedTest] = useState(0);
  const [customContent, setCustomContent] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const currentTest = useCustom ? 
    { name: "Custom", content: customContent, expected: "Unknown" } : 
    INTELLIGENT_TEST_CASES[selectedTest];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Intelligent Chat Message Tester</CardTitle>
          <CardDescription>
            Testing the new highlight.js-powered intelligent code detection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {INTELLIGENT_TEST_CASES.map((test, index) => (
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
                placeholder="Enter your test content here..."
                rows={6}
              />
            </div>
          )}

          <div className="border rounded-lg p-4 bg-muted/20">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Test: {currentTest.name}</h3>
              <span className="text-sm text-muted-foreground">Expected: {currentTest.expected}</span>
            </div>
            <pre className="text-sm whitespace-pre-wrap bg-background p-3 rounded border">
              {currentTest.content}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rendered Output</CardTitle>
          <CardDescription>
            How the intelligent chat message component renders the content using highlight.js
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <IntelligentChatMessage 
              role="model" 
              content={currentTest.content} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold text-blue-600 mb-1">Highlight.js Integration:</h4>
              <p className="text-muted-foreground">
                Uses highlight.js automatic language detection with relevance scoring to determine if content is code or text.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-1">Confidence Scoring:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• 0-10: Plain text</li>
                <li>• 10-20: Possible code (analyzed further)</li>
                <li>• 20+: Likely code (rendered in editor)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-1">Override Patterns:</h4>
              <p className="text-muted-foreground">
                Simple greetings and questions are always treated as text, regardless of highlight.js scoring.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
