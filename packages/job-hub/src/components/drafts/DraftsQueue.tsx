'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Send } from 'lucide-react';

interface CommEntry {
  type?: string;
  subject?: string;
  status?: string;
  scheduled_for?: string;
  gmail_draft_link?: string;
}

interface Draft {
  id: string;
  jobId: string;
  companyName: string;
  type: string;
  subject: string;
  status: string;
  dueDate: string;
  gmailDraftUrl?: string;
}

export function DraftsQueue() {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'jobs'),
      where('status', 'in', ['RENDERED', 'DRAFTED', 'INTERVIEWING']),
      orderBy('timestamps.updated_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pending: Draft[] = [];
      snapshot.docs.forEach(doc => {
        const d = doc.data();
        if (d.comms_sequence) {
          d.comms_sequence.forEach((comm: CommEntry, index: number) => {
            if (comm.status !== 'SENT') {
              pending.push({
                id: `${doc.id}_${index}`,
                jobId: doc.id,
                companyName: d.company?.name || 'Unknown',
                type: comm.type || 'OUTREACH',
                subject: comm.subject || 'No Subject Generated',
                status: comm.status || 'PENDING',
                dueDate: comm.scheduled_for || d.timestamps?.updated_at || new Date().toISOString(),
                gmailDraftUrl: comm.gmail_draft_link,
              });
            }
          });
        }
      });
      pending.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      setDrafts(pending);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
        <div>
          <h3 className="text-zinc-100 font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-500" /> Pending Action Queue
          </h3>
          <p className="text-sm text-zinc-400 mt-1">Manual dispatch sequence. DRAFT_ONLY enforces user-intervention.</p>
        </div>
        <Badge variant="secondary" className="bg-zinc-800">{drafts.length} Actionable Drafts</Badge>
      </div>

      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map(draft => (
            <Card key={draft.id} className="bg-zinc-950 border-zinc-800 flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  <Badge className="bg-blue-500/20 text-blue-400 border-none">{draft.type}</Badge>
                  <span className="text-xs text-zinc-500">Due: {new Date(draft.dueDate).toLocaleDateString()}</span>
                </div>
                <CardTitle className="text-lg text-zinc-100 line-clamp-1">{draft.companyName}</CardTitle>
                <CardDescription className="text-zinc-400 line-clamp-2 mt-1">{draft.subject}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-4 border-t border-zinc-900 flex justify-end">
                {draft.gmailDraftUrl ? (
                  <a href={draft.gmailDraftUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-md px-4 py-2 border border-zinc-700 transition-colors">
                    <Send className="h-4 w-4" /> Open in Gmail
                  </a>
                ) : (
                  <span className="text-xs text-zinc-600 italic">Awaiting API generation...</span>
                )}
              </CardContent>
            </Card>
          ))}
          {drafts.length === 0 && (
            <div className="col-span-full text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              No pending drafts. Your active pipeline is clear.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
