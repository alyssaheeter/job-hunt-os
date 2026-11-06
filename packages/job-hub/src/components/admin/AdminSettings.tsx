'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Server, Database, Zap } from 'lucide-react';

export function AdminSettings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <Server className="h-5 w-5 text-purple-500" /> Platform Isolation
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Current Tenant Context. Altering TenantID destroys local cache rules.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="tenantId" className="text-zinc-400">Active Tenant ID</Label>
            <Input id="tenantId" defaultValue="tenant_alpha_01" disabled className="bg-zinc-900 border-zinc-800 text-zinc-500 font-mono" />
          </div>
          <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <div className="space-y-0.5">
              <Label className="text-zinc-200">Enforce DRAFT_ONLY execution</Label>
              <p className="text-sm text-zinc-500">Gmail service yields Draft payloads only — no Send execution vectors.</p>
            </div>
            <Switch defaultChecked disabled />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" /> Cost Limits and Token Quotas
          </CardTitle>
          <CardDescription className="text-zinc-400">Context caching expiry and maximum payload thresholds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="modelId" className="text-zinc-400">Vertex Canonical Model Binding</Label>
            <Input id="modelId" defaultValue="gemini-1.5-pro-001" disabled className="bg-zinc-900 border-zinc-800 text-zinc-500 font-mono" />
          </div>
          <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <div className="space-y-0.5">
              <Label className="text-zinc-200">Active Context Caching</Label>
              <p className="text-sm text-zinc-500">Maintains prompt instructions in Vertex RAM for reduced token cost.</p>
            </div>
            <Switch defaultChecked disabled />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-950/10 border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2">
            <Database className="h-5 w-5" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-400">Destructive environment modifications requiring Admin 2FA elevation.</p>
          <Button variant="destructive" className="bg-red-900/20 text-red-500 border border-red-900 hover:bg-red-900 hover:text-white transition-colors" disabled>
            Purge Tenant Firestore Namespace
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
