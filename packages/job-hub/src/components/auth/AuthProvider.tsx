'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                setLoading(false);
            } else {
                // No user — trigger anonymous sign-in so Firestore rules pass
                signInAnonymously(auth).catch((err) => {
                    console.error('Anonymous sign-in failed:', err);
                    setLoading(false);
                });
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-sm text-zinc-500">Initializing JHOS…</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
