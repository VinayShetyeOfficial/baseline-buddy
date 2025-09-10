
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Sparkles, Lightbulb, Puzzle, FileText, Code, Github } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { checkCodeCompatibility, CheckCodeCompatibilityOutput } from '@/ai/flows/check-code-compatibility';
import { suggestCompatibleSnippets, SuggestCompatibleSnippetsOutput } from '@/ai/flows/suggest-compatible-snippets';
import { generatePolyfills, GeneratePolyfillsOutput } from '@/ai/flows/generate-polyfills';
import { Skeleton } from '@/components/ui/skeleton';
import { CodeEditor } from '@/components/code-editor';
import { BrowserSelector } from '@/components/browser-selector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import { Input } from '@/components/ui/input';
import { ReadOnlyCodeEditor } from '@/components/read-only-code-editor';
import { js_beautify } from 'js-beautify';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const defaultCodeSnippet = `// Paste your code here for analysis...
// Example JavaScript:
const data = await fetch('/api/data')
const newArray = originalArray.with(2, 6);

/* Example CSS: */
.container {
    display: grid;
    container-type: inline-size;
}

ul:has(li.special) {
    background: lightyellow;
    border: 1px solid gold;
}

// Example Web APIs:
if (navigator.share) {
    navigator.share({ title: 'Hello World' })
}
`;

const EmptyState = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="mx-auto w-fit rounded-full bg-primary/10 p-4">
            {icon}
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
        <CardDescription className="mt-2 max-w-xs">
            {description}
        </CardDescription>
    </div>
);


export default function Home() {
  const { toast } = useToast();
  const [code, setCode] = useState(defaultCodeSnippet);
  const [selectedBrowsers, setSelectedBrowsers] = useState<string[]>([
    'chrome',
    'firefox',
    'safari',
    'edge',
  ]);

  const [compatibilityResult, setCompatibilityResult] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestCompatibleSnippetsOutput['suggestions']>([]);
  const [polyfills, setPolyfills] = useState<GeneratePolyfillsOutput['polyfills']>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('compatibility');

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Error',
        description: 'Please enter some code to analyze.',
      });
      return;
    }
    if (selectedBrowsers.length === 0) {
        toast({
            variant: 'destructive',
            title: 'Input Error',
            description: 'Please select at least one target browser.',
        });
        return;
    }
    
    setLoading(true);
    setError('');
    setCompatibilityResult(null);
    setSuggestions([]);
    setPolyfills([]);

    try {
        const compatibilityPromise = checkCodeCompatibility({ codeSnippet: code });
        const suggestionsPromise = suggestCompatibleSnippets({ code, targetBrowsers: selectedBrowsers.join(', ') });
        const polyfillsPromise = generatePolyfills({ codeSnippet: code, targetBrowsers: selectedBrowsers.join(', ') });
        
        const [compat, sugg, poly] = await Promise.all([
            compatibilityPromise,
            suggestionsPromise,
            polyfillsPromise
        ]);

        setCompatibilityResult(compat.compatibilityReport);
        
        const beautifyOptions = { indent_size: 2, space_in_empty_paren: true };
        const beautifiedSuggestions = sugg.suggestions.map(s => ({
            ...s,
            code: js_beautify(s.code, beautifyOptions)
        }));
        setSuggestions(beautifiedSuggestions);

        const beautifiedPolyfills = poly.polyfills.map(p => ({
            ...p,
            code: p.code ? js_beautify(p.code, beautifyOptions) : ''
        }));
        setPolyfills(beautifiedPolyfills);

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        
        if (errorMessage.includes('503 Service Unavailable') || errorMessage.includes('model is overloaded')) {
            setError('The AI model is currently overloaded. Please try again in a few moments.');
            toast({
                variant: 'destructive',
                title: 'Service Unavailable',
                description: 'The AI model is currently busy. Please try again later.',
            });
        } else {
            setError('An error occurred during analysis. Please check your browser console for more technical details.');
            toast({
                variant: 'destructive',
                title: 'Error Performing Analysis',
                description: errorMessage,
            });
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-6 md:p-8">
      <main className="w-full max-w-7xl flex flex-col items-center">
        <div className="text-center space-y-2 my-8">
            <h1 className="text-3xl sm:text-4xl font-bold">
                Check Web Feature Compatibility
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
                Paste your code, select target browsers, and let Baseline Buddy analyze your feature usage. Get AI-powered suggestions for better compatibility.
            </p>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="lg:sticky lg:top-20">
            <Card className="w-full shadow-lg">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Code size={24} /> Code & Configuration</CardTitle>
                  <CardDescription>
                    Provide your code and select the browsers you are targeting.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="snippet" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="snippet"><Code size={16} className="mr-2"/> Code Snippet</TabsTrigger>
                    <TabsTrigger value="repository"><Github size={16} className="mr-2"/> GitHub Repository</TabsTrigger>
                  </TabsList>
                  <TabsContent value="snippet" className="pt-4">
                    <div className="h-[450px] rounded-xl border border-border shadow-lg bg-[#0f172b] flex flex-col">
                      <CodeEditor value={code} onChange={setCode} />
                    </div>
                  </TabsContent>
                  <TabsContent value="repository" className="pt-4 space-y-4">
                      <div>
                        <label htmlFor="repo-url" className="text-sm font-medium">Repository URL</label>
                        <Input id="repo-url" placeholder="https://github.com/user/repo" className="mt-1"/>
                        <p className="text-xs text-muted-foreground mt-1">Enter the public URL of a GitHub repository to analyze.</p>
                      </div>
                  </TabsContent>
                </Tabs>
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium">Target Browsers</label>
                  <p className="text-xs text-muted-foreground">Select the browsers to check compatibility against.</p>
                  <BrowserSelector selectedBrowsers={selectedBrowsers} onSelectionChange={setSelectedBrowsers} />
                </div>
                <Button onClick={handleAnalyze} disabled={loading} size="lg" className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold">
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Analyze with AI
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle>Compatibility Report</CardTitle>
                <CardDescription>Get a detailed analysis of browser support for the features in your code.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="compatibility" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="compatibility"><FileText size={16} className="mr-2"/> Report</TabsTrigger>
                        <TabsTrigger value="suggestions"><Lightbulb size={16} className="mr-2"/> Suggestions</TabsTrigger>
                        <TabsTrigger value="polyfills"><Puzzle size={16} className="mr-2"/> Polyfills</TabsTrigger>
                    </TabsList>
                    <div className="pt-6 min-h-[400px]">
                        {loading && (
                            <div className="space-y-4 pt-4">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <br/>
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        )}
                        {error && !loading && (
                            <div className="text-destructive flex items-center justify-center flex-col h-full min-h-[400px] gap-4"><AlertCircle size={48}/> <span className="text-lg font-semibold">Error analyzing code</span><p className="text-sm text-center max-w-sm">{error}</p></div>
                        )}
                        {!loading && !error && (
                            <>
                                <TabsContent value="compatibility">
                                    {compatibilityResult ? (
                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-ul:text-foreground">
                                            <ReactMarkdown
                                                components={{
                                                    code({ node, className, children, ...props }) {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        const code = String(children).replace(/\n$/, '');
                                                        return match ? (
                                                            <div className="my-4 rounded-xl border border-border shadow-lg overflow-hidden">
                                                              <ReadOnlyCodeEditor value={code} />
                                                            </div>
                                                        ) : (
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    },
                                                }}
                                            >
                                                {compatibilityResult}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <EmptyState 
                                            icon={<FileText className="h-12 w-12 text-primary" />}
                                            title="Ready to Analyze"
                                            description="Your compatibility report will appear here once you run an analysis."
                                        />
                                    )}
                                </TabsContent>
                                <TabsContent value="suggestions">
                                    {suggestions.length > 0 ? (
                                        <div className="space-y-6">
                                            {suggestions.map((suggestion, index) => (
                                                <div key={index}>
                                                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-ul:text-foreground mb-2">
                                                        <ReactMarkdown>
                                                            {suggestion.explanation}
                                                        </ReactMarkdown>
                                                    </div>
                                                     <div className="h-full rounded-xl border border-border shadow-lg bg-[#0f172b] flex flex-col">
                                                        <ReadOnlyCodeEditor value={suggestion.code} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState 
                                            icon={<Lightbulb className="h-12 w-12 text-primary" />}
                                            title="No Suggestions Yet"
                                            description="AI-powered suggestions for improving compatibility will be shown here."
                                        />
                                    )}
                                </TabsContent>
                                <TabsContent value="polyfills">
                                    {polyfills.length > 0 ? (
                                        <div className="space-y-6">
                                            {polyfills.map((polyfill, index) => (
                                                <div key={index}>
                                                     <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-ul:text-foreground mb-2">
                                                        <ReactMarkdown>
                                                            {polyfill.explanation}
                                                        </ReactMarkdown>
                                                    </div>
                                                    <div className="h-full rounded-xl border border-border shadow-lg bg-[#0f172b] flex flex-col">
                                                        <ReadOnlyCodeEditor value={polyfill.code} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                     ) : (
                                        <EmptyState 
                                            icon={<Puzzle className="h-12 w-12 text-primary" />}
                                            title="No polyfills needed"
                                            description="Based on your code and selected browsers, no polyfills are required."
                                        />
                                    )}
                                </TabsContent>
                            </>
                        )}
                    </div>
                </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
