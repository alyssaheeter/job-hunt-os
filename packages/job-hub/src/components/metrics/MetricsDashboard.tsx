'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AlertCircle } from 'lucide-react';

type SystemMetric = {
  id: string;
  timestamp: string;
  fill_in_rate: number;
  fill_in_count: number;
  drift_alert: boolean;
};

const pct = (v: number) => Math.round(v * 100) + '%';

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'system_metrics'), orderBy('timestamp', 'asc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        timestamp: new Date(d.data().timestamp).toLocaleDateString(),
        fill_in_rate: d.data().fill_in_rate || 0,
        fill_in_count: d.data().fill_in_count || 0,
        drift_alert: d.data().drift_alert || false,
      }));
      setMetrics(data);
    });
    return () => unsubscribe();
  }, []);

  const latest = metrics[metrics.length - 1];

  return (
    <div className="space-y-6">
      {latest?.drift_alert && (
        <div className="bg-red-950/50 border border-red-900 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-400">Canonical Drift Detected</h3>
            <p className="text-sm text-red-300">The most recent Suki payload triggered a {pct(latest.fill_in_rate)} [FILL-IN] gap rate. Review the Golden Dataset fact matrices.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400">Peak [FILL-IN] Count</CardDescription>
            <CardTitle className="text-3xl text-zinc-100">
              {Math.max(...metrics.map(m => m.fill_in_count), 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400">Evaluator Block Rate</CardDescription>
            <CardTitle className="text-3xl text-zinc-100 flex items-baseline gap-2">
              ~42% <span className="text-xs text-zinc-500 font-normal">Est. Disqualified</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400">Total Pipeline Active</CardDescription>
            <CardTitle className="text-3xl text-emerald-500">14</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">System Traceability Drift (Agent Suki)</CardTitle>
          <CardDescription className="text-zinc-400">Tracking the ratio of hallucination avoidance fallback markers [FILL-IN] over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={pct} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                />
                <Line
                  type="monotone"
                  dataKey="fill_in_rate"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#ef4444' }}
                  activeDot={{ r: 6, fill: '#f87171', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
