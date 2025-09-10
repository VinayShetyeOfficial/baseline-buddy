
'use client';

import { useState } from 'react';
import Link from 'next/link';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { githubDark } from '@uiw/codemirror-theme-github';
import { Download, Copy, Check, Expand, Minimize, Github, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';


interface ReadOnlyCodeEditorProps {
  value: string;
  filePath?: string;
}

export function ReadOnlyCodeEditor({ value, filePath }: ReadOnlyCodeEditorProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const lineCount = value.split('\n').length;
  const charCount = value.length;
  const showExpandButton = lineCount > 15;
  const simpleFilePath = filePath ? filePath.split('/').slice(7).join('/') : 'Editor';

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    toast({ title: 'Code copied to clipboard!' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

    const EditorHeader = ({ isDialog = false }: { isDialog?: boolean }) => (
      <div className="flex items-center justify-between px-4 py-2 bg-[#0f172b] text-[#7b8aa1] border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#f96057]"></div>
                <div className="w-3 h-3 rounded-full bg-[#f8ce52]"></div>
                <div className="w-3 h-3 rounded-full bg-[#5fcf65]"></div>
            </div>
            <div className="text-sm font-medium ml-2">
              {filePath ? (
                <Link href={filePath} target="_blank" className="flex items-center gap-1.5 hover:text-white hover:underline">
                    <Github size={14}/> {simpleFilePath} <LinkIcon size={12} className="ml-1" />
                </Link>
              ) : 'Editor'}
            </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#7b8aa1] hover:bg-[#1e293b]" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#7b8aa1] hover:bg-[#1e293b]" onClick={handleCopy}>
            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          {showExpandButton && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-[#7b8aa1] hover:bg-[#1e293b]" onClick={() => setIsExpanded(!isExpanded)}>
              {isDialog ? <Minimize className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    );

  const EditorFooter = () => (
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0f172b] text-[#7b8aa1] text-xs border-t border-[#1e293b]">
        <div>
          Lines: {lineCount} | Characters: {charCount}
        </div>
        <div>JavaScript/CSS/HTML</div>
      </div>
  );

  const Editor = ({ isDialog = false }: { isDialog?: boolean }) => (
     <div className={cn(
        "h-full w-full rounded-md overflow-hidden bg-[#0f172b] flex flex-col",
        isDialog && "h-full"
      )}>
        <EditorHeader isDialog={isDialog} />
        <div className="flex-grow overflow-auto code-block-scrollbar">
            <CodeMirror
            value={value}
            height="100%"
            extensions={[javascript({ jsx: true, typescript: true })]}
            theme={githubDark}
            style={{ height: '100%', fontFamily: '"Source Code Pro", monospace', fontSize: '14px', backgroundColor: '#0f172b' }}
            readOnly={true}
             basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: false,
                autocompletion: false,
             }}
            />
        </div>
        <EditorFooter />
    </div>
  );


  return (
    <>
      <div className="h-full rounded-xl border border-border shadow-lg bg-[#0f172b] flex flex-col">
        <Editor/>
      </div>

       <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent
          showCloseButton={false}
          className="p-0 border-0 bg-transparent w-full max-w-full h-full md:w-11/12 md:max-w-7xl md:h-[90vh]">
          <DialogTitle className="sr-only">Expanded Code Editor</DialogTitle>
          <DialogDescription className="sr-only">
            A larger view of the code editor for a focused editing experience.
          </DialogDescription>
          <Editor isDialog={true} />
        </DialogContent>
      </Dialog>
    </>
  );
}
