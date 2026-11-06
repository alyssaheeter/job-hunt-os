import { MetricsDashboard } from '@/components/metrics/MetricsDashboard';

export default function MetricsPage() {
    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">System Telemetry</h2>
                <p className="text-zinc-400 mt-1">Monitor pipeline health, prompt drift, and token economics.</p>
            </div>

            <MetricsDashboard />
        </div>
    );
}
