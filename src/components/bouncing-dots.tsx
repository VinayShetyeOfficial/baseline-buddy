
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function BouncingDots({ className }: { className?: string }) {
  return (
    <div className={cn('bouncing-loader', className)}>
      <div className="dot1" />
      <div className="dot2" />
      <div className="dot3" />
    </div>
  );
}
