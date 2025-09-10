
'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { BrowserCompatibilityData } from '@/ai/flows/check-code-compatibility';

interface CompatibilityChartProps {
  data: BrowserCompatibilityData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-background border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        <p className={`text-sm ${data.supported ? 'text-green-600' : 'text-red-600'}`}>
          {data.supported ? 'Fully Supported' : 'Not Fully Supported'}
        </p>
        <p className="text-sm text-muted-foreground">User Coverage: {data.Coverage}%</p>
      </div>
    );
  }

  return null;
};

const SupportIcon = ({ supported }: { supported: boolean }) => {
    if (supported) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
};


export function CompatibilityChart({ data }: CompatibilityChartProps) {
  const chartData = data.map(item => ({
    name: item.browser,
    Coverage: item.coverage,
    supported: item.isSupported,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Browser Support Overview</CardTitle>
        <CardDescription>
          Estimated global user coverage for the selected browsers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                    top: 5,
                    right: 20,
                    left: -10,
                    bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                    <Legend iconType="circle" iconSize={8} />
                    <Bar dataKey="Coverage" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.supported ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.3)'} />
                      ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {data.map(browser => (
            <div key={browser.browser} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <SupportIcon supported={browser.isSupported} />
                <span className="font-medium">{browser.browser}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
