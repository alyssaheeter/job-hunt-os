import { AdminSettings } from '@/components/admin/AdminSettings';

export default function AdminPage() {
    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">System Configuration</h2>
                <p className="text-zinc-400 mt-1">Configure environment constraints, observability features, and API rate limits.</p>
            </div>

            <AdminSettings />
        </div>
    );
}
