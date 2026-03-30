'use client';

import { useAuthStore } from '@/src/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-[#1A3C5E] text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">PropAfric — Super Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 text-sm">
            {user.firstName} {user.lastName}
          </span>
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Tableau de bord
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500 mb-1">Agences actives</p>
            <p className="text-3xl font-bold text-[#1A3C5E]">1</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500 mb-1">Abonnements en cours</p>
            <p className="text-3xl font-bold text-[#1A3C5E]">1</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500 mb-1">Revenus mensuels</p>
            <p className="text-3xl font-bold text-[#D4A843]">950 000 F</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Agences abonnées
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">Agence</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">Agence Citron Vert</td>
                  <td className="py-3 px-4 text-slate-600">contact@citronvert.sn</td>
                  <td className="py-3 px-4">
                    <span className="bg-[#1A3C5E]/10 text-[#1A3C5E] px-2 py-1 rounded-full text-xs font-medium">
                      Premium
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      Actif
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}