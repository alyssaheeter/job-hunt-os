import { DraftsQueue } from '@/components/drafts/DraftsQueue';

export default function DraftsPage() {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Drafts Queue</h2>
        <p className="text-zinc-400 mt-1">Review and dispatch pending Gmail communication drafts.</p>
      </div>
      <DraftsQueue />
    </div>
  );
}
