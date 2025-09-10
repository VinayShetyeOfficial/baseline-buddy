import { Code } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary rounded-lg text-primary-foreground">
        <Code className="h-6 w-6" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-primary">
        Baseline Buddy
      </h1>
    </div>
  );
}
