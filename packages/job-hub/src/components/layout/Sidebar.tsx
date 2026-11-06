import Link from 'next/link';
import { Home, LayoutDashboard, Send, FileCheck, BarChart, Settings, ShieldAlert } from 'lucide-react';

export function Sidebar() {
    return (
        <div className="w-64 bg-zinc-950 text-zinc-300 h-screen flex flex-col border-r border-zinc-800">
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-tighter text-white">JHOS <span className="text-zinc-500 font-normal">Hub</span></h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                <Link href="/jobs" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-800 hover:text-white transition-colors">
                    <LayoutDashboard className="h-4 w-4" /> Jobs
                </Link>
                <Link href="/pipeline" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-800 hover:text-white transition-colors">
                    <Home className="h-4 w-4" /> Pipeline
                </Link>
                <Link href="/drafts" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-800 hover:text-white transition-colors">
                    <Send className="h-4 w-4" /> Drafts
                </Link>
                <Link href="/proof-pack" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-800 hover:text-white transition-colors">
                    <FileCheck className="h-4 w-4" /> Proof Pack
                </Link>
                <Link href="/metrics" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-800 hover:text-white transition-colors">
                    <BarChart className="h-4 w-4" /> Metrics
                </Link>
            </nav>
            <div className="p-4 border-t border-zinc-800 space-y-2">
                <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-800 hover:text-white transition-colors text-sm">
                    <Settings className="h-4 w-4" /> Settings
                </Link>
                <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors text-sm">
                    <ShieldAlert className="h-4 w-4" /> Logs & Admin
                </Link>
            </div>
        </div>
    );
}
