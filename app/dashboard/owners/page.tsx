'use client';

import { useAuthStore } from '@/src/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/src/lib/api';
import DashboardLayout from '../components/DashboardLayout';

interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  address: string | null;
  _count: { properties: number };
}

export default function OwnersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '',
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadOwners();
  }, [user]);

  async function loadOwners() {
    try {
      const res = await api.get('/owners');
      setOwners(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/owners', form);
      setShowForm(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', address: '' });
      loadOwners();
    } catch (err) {
      console.error(err);
    }
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Propriétaires</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nouveau propriétaire
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Nouveau propriétaire</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prénom *</label>
              <input required value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
              <input required value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
        ) : owners.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Aucun propriétaire enregistré</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Nom</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Téléphone</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Biens</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr key={owner.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {owner.firstName} {owner.lastName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{owner.phone}</td>
                  <td className="py-3 px-4 text-slate-600">{owner.email || '—'}</td>
                  <td className="py-3 px-4">
                    <span className="bg-[#1A3C5E]/10 text-[#1A3C5E] px-2 py-1 rounded-full text-xs font-medium">
                      {owner._count.properties} bien(s)
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