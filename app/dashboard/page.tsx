'use client';

import { useAuthStore } from '@/src/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/src/lib/api';
import DashboardLayout from './components/DashboardLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadStats();
  }, [user]);

  async function loadStats() {
    try {
      const res = await api.get('/agencies/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Tableau de bord</h2>
        <p className="text-slate-500 text-sm">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-20">Chargement...</div>
      ) : !stats ? (
        <div className="text-center text-slate-500 py-20">Données indisponibles</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 mb-1">Propriétaires</p>
              <p className="text-3xl font-bold text-[#1A3C5E]">{stats.kpis.totalOwners}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 mb-1">Locataires</p>
              <p className="text-3xl font-bold text-[#1A3C5E]">{stats.kpis.totalTenants}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 mb-1">Biens gérés</p>
              <p className="text-3xl font-bold text-[#1A3C5E]">{stats.kpis.totalProperties}</p>
              <p className="text-xs text-slate-400 mt-1">{stats.kpis.occupiedProperties} occupés · {stats.kpis.vacantProperties} vacants</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 mb-1">Contrats actifs</p>
              <p className="text-3xl font-bold text-[#1A3C5E]">{stats.kpis.activeContracts}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 mb-1">Encaissé ce mois</p>
              <p className="text-2xl font-bold text-green-600">{stats.kpis.totalPaidThisMonth.toLocaleString('fr-FR')} F</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 mb-1">Loyers en attente</p>
              <p className="text-3xl font-bold text-[#D4A843]">{stats.kpis.totalPendingPayments}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 mb-1">Loyers en retard</p>
              <p className="text-3xl font-bold text-red-500">{stats.kpis.latePayments}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 mb-1">Taux d'occupation</p>
              <p className="text-3xl font-bold text-[#1A3C5E]">
                {stats.kpis.totalProperties > 0
                  ? Math.round((stats.kpis.occupiedProperties / stats.kpis.totalProperties) * 100)
                  : 0}%
              </p>
            </div>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Revenus des 6 derniers mois</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString('fr-FR')} F`, 'Revenus']} />
                  <Bar dataKey="montant" fill="#1A3C5E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Statut des biens</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.propertyStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {stats.propertyStatus.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Derniers paiements */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Derniers paiements reçus</h3>
            {stats.recentPayments.length === 0 ? (
              <p className="text-slate-500 text-sm">Aucun paiement récent</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Locataire</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Bien</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Période</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPayments.map((p: any) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-800">{p.tenant}</td>
                      <td className="py-2 px-3 text-slate-600">{p.property}</td>
                      <td className="py-2 px-3 text-slate-600">{MONTHS[p.month - 1]} {p.year}</td>
                      <td className="py-2 px-3 font-medium text-green-600">
                        {p.amount.toLocaleString('fr-FR')} F
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}