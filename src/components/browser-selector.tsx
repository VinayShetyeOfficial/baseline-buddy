'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { ChromeIcon, FirefoxIcon, SafariIcon, EdgeIcon } from '@/components/browser-icons';

interface Browser {
  id: 'chrome' | 'firefox' | 'safari' | 'edge';
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const browsers: Browser[] = [
  { id: 'chrome', name: 'Chrome', icon: ChromeIcon },
  { id: 'firefox', name: 'Firefox', icon: FirefoxIcon },
  { id: 'safari', name: 'Safari', icon: SafariIcon },
  { id: 'edge', name: 'Edge', icon: EdgeIcon },
];

interface BrowserSelectorProps {
  selectedBrowsers: string[];
  onSelectionChange: (selected: string[]) => void;
  className?: string;
}

export function BrowserSelector({
  selectedBrowsers,
  onSelectionChange,
  className,
}: BrowserSelectorProps) {
  const handleCheckedChange = (browserId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedBrowsers, browserId]);
    } else {
      onSelectionChange(selectedBrowsers.filter((id) => id !== browserId));
    }
  };

  return (
    <div className={cn('mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2', className)}>
      {browsers.map((browser) => (
        <label
          key={browser.id}
          htmlFor={browser.id}
          className="flex items-center gap-3 p-3 rounded-md border bg-card text-card-foreground hover:bg-accent/50 transition-colors cursor-pointer"
        >
          <Checkbox
            id={browser.id}
            checked={selectedBrowsers.includes(browser.id)}
            onCheckedChange={(checked) => handleCheckedChange(browser.id, !!checked)}
          />
          <div className="flex items-center gap-2">
            <browser.icon className="h-5 w-5" />
            <span className="font-medium text-sm">{browser.name}</span>
          </div>
        </label>
      ))}
    </div>
  );
}
