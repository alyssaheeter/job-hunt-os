'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Play, CheckCircle2, FileText, Send } from 'lucide-react';

export function JobDetail({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'jobs', jobId), (snap) => {
      setJob({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [jobId]);

  const handleAction = async (endpoint: string, actionName: string) => {
    setActioning(actionName);
    try {
      await apiClient.post(`/api/jobs/${jobId}/${endpoint}`);
    } catch (err) {
      console.error('Failed action:', err);
    } finally {
      setActioning(null);
    }
  };

  if (loading) return <div className="p-8 text-zinc-500">Loading Job Context...</div>;
  if (!job) return <div className="p-8 text-red-500">Job Not Found.</div>;

  const baseMax = job.compensation?.base_max;
  const baseDisplay = baseMax ? '$' + Math.round(baseMax / 1000) + 'k Max' : 'Unknown Base';

  return (
    <div className="h-full flex flex-col">
      <div className="bg-zinc-900 border-b border-zinc-800 p-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{job.company?.name || 'Unknown Company'}</h1>
            <Badge variant="outline" className="text-zinc-400 border-zinc-700">{job.status}</Badge>
            {job.total_score > 0 && (
              <Badge className={job.total_score >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                FitScore: {job.total_score}
              </Badge>
            )}
          </div>
          <p className="text-lg text-zinc-300">{job.role?.title}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-zinc-500">
            <span>{job.location?.work_mode}</span>
            <span>{baseDisplay}</span>
            <span className="truncate max-w-md">{job.raw_storage?.gcs_uri}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {job.status === 'INGESTED' && (
            <Button onClick={() => handleAction('normalize', 'normalize')} disabled={!!actioning} className="bg-blue-600 hover:bg-blue-500">
              {actioning === 'normalize' ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Run Normalizer
            </Button>
          )}
          {job.status === 'NORMALIZED' && (
            <Button onClick={() => handleAction('evaluate', 'evaluate')} disabled={!!actioning} className="bg-purple-600 hover:bg-purple-500">
              {actioning === 'evaluate' ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Run Evaluator
            </Button>
          )}
          {job.status === 'EVALUATED' && (
            <div className="flex gap-2">
              <Button onClick={() => handleAction('reject', 'reject')} variant="destructive" disabled={!!actioning}>Reject</Button>
              <Button onClick={() => handleAction('approve', 'approve')} className="bg-emerald-600 hover:bg-emerald-500" disabled={!!actioning}>
                {actioning === 'approve' ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Approve Target
              </Button>
            </div>
          )}
          {job.status === 'APPROVED' && (
            <Button onClick={() => handleAction('generate', 'generate')} disabled={!!actioning} className="bg-emerald-600 hover:bg-emerald-500">
              {actioning === 'generate' ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Generate Assets
            </Button>
          )}
          {job.status === 'GENERATED' && (
            <Button onClick={() => handleAction('render', 'render')} disabled={!!actioning} className="bg-blue-600 hover:bg-blue-500">
              {actioning === 'render' ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
              Render DOCX
            </Button>
          )}
          {job.status === 'RENDERED' && (
            <Button onClick={() => handleAction('drafts', 'drafts')} disabled={!!actioning} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
              {actioning === 'drafts' ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Create Gmail Drafts
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-zinc-900/50 border border-zinc-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ats">ATS Profile</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluation Details</TabsTrigger>
            <TabsTrigger value="generation">Traceability Matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader><CardTitle className="text-zinc-100">Strike Zone Rationale</CardTitle></CardHeader>
              <CardContent>
                <p className="text-zinc-300">{job.strike_zone_rationale || 'Awaiting Evaluator Agent...'}</p>
                {job.recruiter_questions && job.recruiter_questions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-red-400 mb-2">Critical Recruiter Questions</h4>
                    <ul className="list-disc pl-5 text-sm text-zinc-400 space-y-1">
                      {job.recruiter_questions.map((q: string, i: number) => <li key={i}>{q}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ats" className="mt-4 space-y-4">
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader><CardTitle className="text-zinc-100">Keywords & Core Clustering</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(job.skills_required || []).map((s: string) => <Badge key={s} variant="secondary" className="bg-zinc-800">{s}</Badge>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluation" className="mt-4 space-y-4">
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader><CardTitle className="text-zinc-100">Score Breakdown</CardTitle></CardHeader>
              <CardContent>
                <p className="text-zinc-400 text-sm">Run the Evaluator agent to populate subtractive score evidence.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generation" className="mt-4 space-y-4">
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader><CardTitle className="text-zinc-100">Fact Traceability Matrix</CardTitle></CardHeader>
              <CardContent>
                <p className="text-zinc-400 text-sm">Approved assets will display fact_id mappings here for audit.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
