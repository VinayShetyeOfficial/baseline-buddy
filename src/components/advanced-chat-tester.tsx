'use client';

import React, { useState } from 'react';
import { AdvancedChatMessage } from './advanced-chat-message';
import { SmartChatMessage } from './smart-chat-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PROBLEM_CASES = [
  {
    name: "Simple Greeting (Should be Text)",
    content: `Hye, how are you ?`
  },
  {
    name: "Single Word Command (Should be Text)", 
    content: `Explain:`
  },
  {
    name: "Question (Should be Text)",
    content: `What is this code doing?`
  },
  {
    name: "Pure Code (Should be Code Editor)",
    content: `const newArray = [...originalArray];
newArray[2] = 6;`
  },
  {
    name: "Text + Code (Mixed)",
    content: `Here's the solution:

const newArray = [...originalArray];
newArray[2] = 6;`
  },
  {
    name: "Code + Text (Mixed)",
    content: `const newArray = [...originalArray];
newArray[2] = 6;

This creates a new array.`
  },
  {
    name: "Text + Code + Text",
    content: `Explain

if (navigator.share) {
  navigator.share({ title: 'Hello World' });
}

what is the code ?`
  },
  {
    name: "Fenced Code Block",
    content: `Here's a JavaScript example:

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

This function greets a user.`
  },
  {
    name: "Inline Code",
    content: `Use the \`navigator.share\` API for sharing content.`
  },
  {
    name: "Complex Conversation",
    content: `Hello! I am an AI assistant, and I'm ready to help you with any follow-up questions you have about the browser compatibility analysis of your code. How can I assist you further today?`
  }
];

export function AdvancedChatTester() {
  const [selectedTest, setSelectedTest] = useState(0);
  const [customContent, setCustomContent] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const currentContent = useCustom ? customContent : PROBLEM_CASES[selectedTest]?.content || '';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Chat Message Tester</CardTitle>
          <CardDescription>
            Compare the old vs new approach with problematic test cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PROBLEM_CASES.map((test, index) => (
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
            <h3 className="font-semibold mb-2">Test Content:</h3>
            <pre className="text-sm whitespace-pre-wrap bg-background p-3 rounded border">
              {currentContent}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">Side by Side</TabsTrigger>
          <TabsTrigger value="old">Old Implementation</TabsTrigger>
          <TabsTrigger value="new">New Implementation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comparison">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Old Smart Implementation</CardTitle>
                <CardDescription>
                  Current implementation (has false positive issues)
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
                <CardTitle className="text-green-600">New Advanced Implementation</CardTitle>
                <CardDescription>
                  Advanced implementation with better detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AdvancedChatMessage 
                    role="model" 
                    content={currentContent} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="old">
          <Card>
            <CardHeader>
              <CardTitle>Old Smart Implementation</CardTitle>
            </CardHeader>
            <CardContent>
              <SmartChatMessage 
                role="model" 
                content={currentContent} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>New Advanced Implementation</CardTitle>
            </CardHeader>
            <CardContent>
              <AdvancedChatMessage 
                role="model" 
                content={currentContent} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Expected Behavior for Test Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-green-600 mb-2">Should Render as Text:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• "Hye, how are you ?" - Simple greeting</li>
                <li>• "Explain:" - Single word command</li>
                <li>• "What is this code doing?" - Questions</li>
                <li>• Conversational responses</li>
                <li>• Short explanatory text</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Should Render as Code:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• JavaScript functions and variables</li>
                <li>• HTML tags and structures</li>
                <li>• CSS selectors and properties</li>
                <li>• Fenced code blocks (```)</li>
                <li>• Multi-line code snippets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
