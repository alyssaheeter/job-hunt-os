import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Briefcase, LayoutDashboard, BarChart3, Mail, Shield, BookOpen } from 'lucide-react';
import { AuthProvider } from '@/components/auth/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Job Hub | JHOS',
  description: 'Job Hunt OS – Pipeline Control Center',
};

const navItems = [
  { href: '/jobs', label: 'Opportunities', icon: Briefcase },
  { href: '/pipeline', label: 'Pipeline', icon: LayoutDashboard },
  { href: '/drafts', label: 'Drafts Queue', icon: Mail },
  { href: '/metrics', label: 'Telemetry', icon: BarChart3 },
  { href: '/proof-pack', label: 'Proof Pack', icon: BookOpen },
  { href: '/admin', label: 'Admin', icon: Shield },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className + ' bg-zinc-950 text-zinc-100 flex h-screen overflow-hidden'}>
        <AuthProvider>
          <aside className="w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col flex-shrink-0">
            <div className="p-6 border-b border-zinc-800">
              <h1 className="text-lg font-bold text-white tracking-tight">Job Hub</h1>
              <p className="text-xs text-zinc-500 mt-0.5">JHOS v3 — Deterministic Pipeline</p>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-600">tenant_alpha_01</p>
            </div>
          </aside>
          <main className="flex-1 overflow-y-auto bg-zinc-950">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
