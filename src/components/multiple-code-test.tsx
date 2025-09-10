'use client';

import React, { useState } from 'react';
import { ChatMessage } from './chat-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const MULTIPLE_CODE_TEST_CASES = [
  {
    name: "Your Exact Scenario",
    content: `What is this? Explain the code

const newArray = [...originalArray];
newArray[2] = 6;

Let it explain me some particular part of the code

const result = newArray.map(item => item * 2);
console.log(result);`
  },
  {
    name: "Text + Code + Text + Code",
    content: `Here's some text before the first code block

function firstFunction() {
  return 'Hello';
}

Now here's some text between code blocks

function secondFunction() {
  return 'World';
}

And finally some text after the last code block`
  },
  {
    name: "Multiple Code Blocks with Text",
    content: `Here's the first function:

function greet(name) {
  return \`Hello, \${name}!\`;
}

Now here's another function:

function calculateSum(a, b) {
  return a + b;
}

And finally, here's how to use them:

const message = greet('World');
const total = calculateSum(5, 3);
console.log(message, total);`
  },
  {
    name: "HTML + CSS + JavaScript",
    content: `Here's the HTML structure:

<div class="container">
  <h1>Welcome</h1>
  <button id="myButton">Click me</button>
</div>

Here's the CSS styling:

.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

#myButton {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
}

And here's the JavaScript:

document.getElementById('myButton').addEventListener('click', function() {
  console.log('Button clicked!');
});`
  },
  {
    name: "Complex Mixed Content",
    content: `First, let's create a user object:

const user = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com'
};

Now let's add a method to it:

user.greet = function() {
  return \`Hello, I'm \${this.name}\`;
};

Finally, let's use it:

console.log(user.greet());
console.log('User age:', user.age);`
  }
];

export function MultipleCodeTest() {
  const [selectedTest, setSelectedTest] = useState(0);
  const [customContent, setCustomContent] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const currentContent = useCustom ? customContent : MULTIPLE_CODE_TEST_CASES[selectedTest]?.content || '';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Multiple Code Blocks Test</CardTitle>
          <CardDescription>
            Test the enhanced chat message rendering with multiple code blocks separated by text
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {MULTIPLE_CODE_TEST_CASES.map((test, index) => (
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
                placeholder="Enter your custom text and code combination here..."
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
            How the enhanced chat message component renders the content with multiple code blocks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ChatMessage 
              role="model" 
              content={currentContent} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
