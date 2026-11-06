'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type UIJob = {
  id: string;
  company: string;
  title: string;
  status: string;
  score: number;
  workMode: string;
  baseMax: number | null;
};

export function JobsTable() {
  const [jobs, setJobs] = useState<UIJob[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('timestamps.updated_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          company: d.company?.name || 'Unknown',
          title: d.role?.title || 'Unknown Role',
          status: d.status || 'INGESTED',
          score: d.total_score || 0,
          workMode: d.location?.work_mode || 'unknown',
          baseMax: d.compensation?.base_max || null,
        };
      });
      setJobs(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="rounded-md border border-zinc-800">
      <Table>
        <TableHeader className="bg-zinc-900/50">
          <TableRow className="border-zinc-800">
            <TableHead className="text-zinc-400">Company</TableHead>
            <TableHead className="text-zinc-400">Role</TableHead>
            <TableHead className="text-zinc-400">Status</TableHead>
            <TableHead className="text-zinc-400">FitScore</TableHead>
            <TableHead className="text-zinc-400">Mode</TableHead>
            <TableHead className="text-zinc-400 text-right">Base Ceiling</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id} className="border-zinc-800 hover:bg-zinc-800/50 cursor-pointer">
              <TableCell className="font-medium text-zinc-100">
                <Link href={'/jobs/' + job.id} className="hover:underline">{job.company}</Link>
              </TableCell>
              <TableCell className="text-zinc-300">{job.title}</TableCell>
              <TableCell>
                <Badge variant={job.status === 'ERROR' ? 'destructive' : 'secondary'} className="bg-zinc-800 text-zinc-300">
                  {job.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span className={job.score >= 80 ? 'text-green-400' : 'text-zinc-500'}>
                  {job.score > 0 ? job.score : '-'}
                </span>
              </TableCell>
              <TableCell className="capitalize text-zinc-400">{job.workMode}</TableCell>
              <TableCell className="text-right text-zinc-400">
                {job.baseMax ? '$' + Math.round(job.baseMax / 1000) + 'k' : 'Unknown'}
              </TableCell>
            </TableRow>
          ))}
          {jobs.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                No active jobs. Ingest a JD to begin.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
