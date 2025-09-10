'use client';

import React, { useState } from 'react';
import { SmartChatMessage } from './smart-chat-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const TEST_CASES = [
  {
    name: "Your Exact Issue",
    content: `EXPLAIN ME:

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
  // (e.g., Firefox Desktop, Safari Desktop)
  navigator.clipboard.writeText(window.location.href)
    .then(() => {
      alert('URL copied to clipboard!');
    })
    .catch(err => {
      alert('Failed to copy URL to clipboard');
    });
}`
  },
  {
    name: "Text + Code + Text + Code",
    content: `What is this? Explain the code

const newArray = [...originalArray];
newArray[2] = 6;

Let it explain me some particular part of the code

const result = newArray.map(item => item * 2);
console.log(result);`
  },
  {
    name: "Multiple Code Blocks",
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
    name: "Fenced Code Blocks",
    content: `Here's a JavaScript function:

\`\`\`javascript
function processData(data) {
  return data.map(item => ({
    id: item.id,
    name: item.name.toUpperCase(),
    processed: true
  }));
}
\`\`\`

And here's some CSS:

\`\`\`css
.button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
}
\`\`\`

This creates a complete example.`
  },
  {
    name: "Inline Code",
    content: `Use the \`navigator.share\` API for sharing content. The \`fetch()\` function is used for API calls. You can also use \`localStorage.setItem()\` to store data.`
  },
  {
    name: "Complex Mixed Content",
    content: `This is a complex example with multiple code blocks:

First, here's a function:

\`\`\`javascript
const data = await fetch('/api/data');
const result = await data.json();
\`\`\`

Then we have some HTML:

<div class="result">
  <p>Result: \${result.message}</p>
</div>

And finally some CSS:

\`\`\`css
.result {
  background-color: #f0f0f0;
  padding: 20px;
}
\`\`\`

This creates a complete example.`
  },
  {
    name: "SQL Code",
    content: `Here's a SQL query:

SELECT u.name, u.email, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY order_count DESC;

This query finds users with orders created after 2024.`
  },
  {
    name: "Code with Comments",
    content: `Here's code with extensive comments:

// This function handles user authentication
function authenticateUser(username, password) {
  // Validate input parameters
  if (!username || !password) {
    throw new Error('Username and password are required');
  }
  
  // Check if user exists in database
  const user = database.findUser(username);
  
  // Verify password hash
  if (user && bcrypt.compareSync(password, user.passwordHash)) {
    return { success: true, user: user };
  }
  
  // Return failure if authentication fails
  return { success: false, error: 'Invalid credentials' };
}

This function provides secure user authentication.`
  }
];

export function SmartChatTester() {
  const [selectedTest, setSelectedTest] = useState(0);
  const [customContent, setCustomContent] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const currentContent = useCustom ? customContent : TEST_CASES[selectedTest]?.content || '';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Smart Chat Message Tester</CardTitle>
          <CardDescription>
            Test the new smart chat message rendering with improved text/code separation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {TEST_CASES.map((test, index) => (
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
            How the smart chat message component renders the content
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
    </div>
  );
}
