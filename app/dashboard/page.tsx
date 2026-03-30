'use client';

import { useAuthStore } from '@/src/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/src/lib/api';
import DashboardLayout from './components/DashboardLayout';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({
    owners: 0,
    tenants: 0,
    properties: 0,
    contracts: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadStats();
  }, [user]);

  async function loadStats() {
    try {
      const [owners, tenants, properties, contracts, pending] = await Promise.all([
        api.get('/owners'),
        api.get('/tenants'),
        api.get('/properties'),
        api.get('/contracts'),
        api.get('/rent-payments/pending'),
      ]);
      setStats({
        owners: owners.data.length,
        tenants: tenants.data.length,
        properties: properties.data.length,
        contracts: contracts.data.length,
        pendingPayments: pending.data.length,
      });
    } catch (err) {
      console.error(err);
    }
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Tableau de bord</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500 mb-1">Propriétaires</p>
          <p className="text-3xl font-bold text-[#1A3C5E]">{stats.owners}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500 mb-1">Locataires</p>
          <p className="text-3xl font-bold text-[#1A3C5E]">{stats.tenants}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500 mb-1">Biens</p>
          <p className="text-3xl font-bold text-[#1A3C5E]">{stats.properties}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500 mb-1">Contrats actifs</p>
          <p className="text-3xl font-bold text-[#1A3C5E]">{stats.contracts}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500 mb-1">Loyers en attente</p>
          <p className="text-3xl font-bold text-[#D4A843]">{stats.pendingPayments}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}