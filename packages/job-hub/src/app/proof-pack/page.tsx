import { ProofPackManager } from '@/components/proof-pack/ProofPackManager';

export default function ProofPackPage() {
    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">Proof Pack Manager</h2>
                <p className="text-zinc-400 mt-1">Govern the deterministic Truth Layer that overrides generative LLM output.</p>
            </div>

            <ProofPackManager />
        </div>
    );
}
