import { KanbanBoard } from '@/components/pipeline/KanbanBoard';

export default function PipelinePage() {
    return (
        <div className="p-8 h-full flex flex-col">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">Pipeline Control</h2>
                <p className="text-zinc-400 mt-1">Track candidate funnel progression and output artifacts.</p>
            </div>

            <div className="flex-1 min-h-0">
                <KanbanBoard />
            </div>
        </div>
    );
}
