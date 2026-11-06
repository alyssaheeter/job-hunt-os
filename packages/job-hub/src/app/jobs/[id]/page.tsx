import { JobDetail } from '@/components/jobs/detail/JobDetail';

export default function JobDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="h-full">
            <JobDetail jobId={params.id} />
        </div>
    );
}
