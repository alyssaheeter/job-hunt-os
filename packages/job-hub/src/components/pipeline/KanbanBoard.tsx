'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

type PipelineCard = {
  id: string;
  company: string;
  title: string;
  status: string;
  score: number;
};

const COLUMNS = [
  { id: 'APPROVED', title: 'Target', color: 'border-t-zinc-500' },
  { id: 'GENERATED', title: 'Asset Generated', color: 'border-t-blue-500' },
  { id: 'DRAFTED', title: 'Comms Drafted', color: 'border-t-emerald-500' },
  { id: 'INTERVIEWING', title: 'Interviewing', color: 'border-t-purple-500' },
  { id: 'REJECTED', title: 'Archived', color: 'border-t-red-500' },
];

export function KanbanBoard() {
  const [jobs, setJobs] = useState<PipelineCard[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('timestamps.updated_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        company: d.data().company?.name || 'Unknown',
        title: d.data().role?.title || 'Unknown Role',
        status: d.data().status || 'INGESTED',
        score: d.data().total_score || 0,
      }));
      setJobs(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {COLUMNS.map(col => {
        const colJobs = jobs.filter(j => j.status === col.id);
        return (
          <div key={col.id} className={'flex-shrink-0 w-80 bg-zinc-900/50 rounded-lg flex flex-col border border-zinc-800 border-t-2 ' + col.color}>
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-semibold text-zinc-100">{col.title}</h3>
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">{colJobs.length}</Badge>
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {colJobs.map(job => (
                  <Card key={job.id} className="bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-medium text-zinc-100 line-clamp-1">{job.company}</CardTitle>
                        <Badge variant="outline" className={job.score >= 80 ? 'text-green-400 border-green-400/20 text-xs' : 'text-zinc-500 border-zinc-800 text-xs'}>
                          {job.score > 0 ? job.score : '-'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-zinc-400 line-clamp-1">{job.title}</p>
                    </CardContent>
                  </Card>
                ))}
                {colJobs.length === 0 && (
                  <div className="text-xs text-zinc-600 text-center py-8 italic">Empty Queue</div>
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
