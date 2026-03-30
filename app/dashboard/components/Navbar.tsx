'use client';

import { useAuthStore } from '@/src/lib/store';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  return (
    <nav className="bg-[#1A3C5E] text-white px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold">PropAfric</h1>
      <div className="flex items-center gap-4">
        <span className="text-slate-300 text-sm">
          {user?.firstName} {user?.lastName}
        </span>
        <button
          onClick={() => { logout(); router.push('/login'); }}
          className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}