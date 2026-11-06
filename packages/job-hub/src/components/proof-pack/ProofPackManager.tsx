'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileCheck, ShieldAlert, Lock } from 'lucide-react';

export function ProofPackManager() {
    return (
        <div className="space-y-6">
            <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-100 flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-blue-500" /> Canonical Facts Matrix
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Manage the underlying \`facts.json\` truth layer preventing LLM hallucinations.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center py-12">
                    <Upload className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 max-w-md mx-auto">Upload a new Truth Layer payload. All \`fact_id\` keys must remain deterministic for Agent Suki to execute the traceability constraint matrix.</p>
                    <Button className="mt-4 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white" disabled>
                        Update Facts Matrix (JSON)
                    </Button>
                </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-100 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-amber-500" /> Evidence Excerpts
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        V3 Evaluator subtractive evidence configuration limits.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-md flex items-center gap-3">
                        <Lock className="h-4 w-4 text-amber-500/50" />
                        <p className="text-sm text-amber-500/80">Proof excerpt weighting is currently locked to Server-Side configuration.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
