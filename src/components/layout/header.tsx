import { Code2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold text-primary">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Code2 className="w-6 h-6" />
            </div>
            <span className="font-headline">Baseline Buddy</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="https://baseline.devpost.com/" target="_blank">Hackathon</Link>
            </Button>
            <Button asChild>
              <Link href="https://github.com/firebase/studio-samples/tree/main/baseline-buddy" target="_blank">View on GitHub</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
