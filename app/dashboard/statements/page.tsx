'use client';

import { useAuthStore } from '@/src/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/src/lib/api';
import DashboardLayout from '../components/DashboardLayout';

interface OwnerStatement {
  id: string;
  name: string;
  phone: string;
  totalProperties: number;
  totalPaidRents: number;
}

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
];

export default function StatementsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [owners, setOwners] = useState<OwnerStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadOwners();
  }, [user]);

  async function loadOwners() {
    try {
      const res = await api.get('/statements/owners');
      setOwners(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function downloadStatement(ownerId: string, ownerName: string) {
    setGenerating(ownerId);
    try {
      const res = await api.get(
        `/statements/owner/${ownerId}/pdf?month=${selectedMonth}&year=${selectedYear}`
      );
      const { pdfBase64, filename } = res.data;
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      link.download = filename;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(null);
    }
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Relevés propriétaires</h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {MONTHS.map((m, i) => (
              <option key={i+1} value={i+1}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement...</div>
        ) : owners.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Aucun propriétaire</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Propriétaire</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Téléphone</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Biens</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Loyers encaissés</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr key={owner.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">{owner.name}</td>
                  <td className="py-3 px-4 text-slate-600">{owner.phone}</td>
                  <td className="py-3 px-4">
                    <span className="bg-[#1A3C5E]/10 text-[#1A3C5E] px-2 py-1 rounded-full text-xs font-medium">
                      {owner.totalProperties} bien(s)
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {owner.totalPaidRents.toLocaleString('fr-FR')} F
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => downloadStatement(owner.id, owner.name)}
                      disabled={generating === owner.id}
                      className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                      {generating === owner.id ? '⏳ Génération...' : '📊 Relevé PDF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}