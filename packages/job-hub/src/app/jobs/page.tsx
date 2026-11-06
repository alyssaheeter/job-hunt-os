import { JobsTable } from '@/components/jobs/JobsTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function JobsPage() {
    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Active Opportunities</h2>
                    <p className="text-zinc-400 mt-1">Review, gate, and track pipeline status.</p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
                    <Plus className="h-4 w-4" /> Ingest JD
                </Button>
            </div>

            <div className="flex-1 min-h-0">
                <JobsTable />
            </div>
        </div>
    );
}
