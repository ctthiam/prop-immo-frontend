'use client';

import { useAuthStore } from '@/src/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/src/lib/api';
import DashboardLayout from '../components/DashboardLayout';

interface Provider {
  id: string;
  name: string;
  type: string;
  phone: string;
  email: string | null;
  address: string | null;
  _count: { workOrders: number };
}

const PROVIDER_TYPES = [
  'Plombier', 'Électricien', 'Peintre', 'Maçon', 'Menuisier',
  'Ascensoriste', 'Jardinier', 'Pisciniste', 'Nettoyage', 'Gardiennage',
  'Climatisation', 'Informatique', 'Autre'
];

export default function ProvidersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'Plombier', phone: '', email: '', address: '',
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadProviders();
  }, [user]);

  async function loadProviders() {
    try {
      const res = await api.get('/providers');
      setProviders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/providers', form);
      setShowForm(false);
      setForm({ name: '', type: 'Plombier', phone: '', email: '', address: '' });
      loadProviders();
    } catch (err) {
      console.error(err);
    }
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Prestataires</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nouveau prestataire
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Nouveau prestataire</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
              <input required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Mamadou Plomberie"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
              <select value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {PROVIDER_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone *</label>
              <input required value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
              <input value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                Annuler
              </button>
              <button type="submit"
                className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement...</div>
        ) : providers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Aucun prestataire enregistré</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Nom</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Téléphone</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Interventions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr key={provider.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">{provider.name}</td>
                  <td className="py-3 px-4">
                    <span className="bg-[#1A3C5E]/10 text-[#1A3C5E] px-2 py-1 rounded-full text-xs font-medium">
                      {provider.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{provider.phone}</td>
                  <td className="py-3 px-4 text-slate-600">{provider.email || '—'}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-medium">
                      {provider._count.workOrders} intervention(s)
                    </span>
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