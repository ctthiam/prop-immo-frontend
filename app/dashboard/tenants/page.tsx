'use client';

import { useAuthStore } from '@/src/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/src/lib/api';
import DashboardLayout from '../components/DashboardLayout';

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  profession: string | null;
  contractType: string;
  _count: { contracts: number };
}

export default function TenantsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', profession: '', contractType: 'HABITATION',
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadTenants();
  }, [user]);

  async function loadTenants() {
    try {
      const res = await api.get('/tenants');
      setTenants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/tenants', form);
      setShowForm(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', profession: '', contractType: 'HABITATION' });
      loadTenants();
    } catch (err) {
      console.error(err);
    }
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Locataires</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nouveau locataire
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Nouveau locataire</h3>
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Profession</label>
              <input value={form.profession}
                onChange={(e) => setForm({ ...form, profession: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type de contrat</label>
              <select value={form.contractType}
                onChange={(e) => setForm({ ...form, contractType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="HABITATION">Habitation</option>
                <option value="PROFESSIONNEL">Professionnel</option>
              </select>
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
        ) : tenants.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Aucun locataire enregistré</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Nom</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Téléphone</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Profession</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Contrats</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {tenant.firstName} {tenant.lastName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{tenant.phone}</td>
                  <td className="py-3 px-4 text-slate-600">{tenant.profession || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tenant.contractType === 'HABITATION'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {tenant.contractType === 'HABITATION' ? 'Habitation' : 'Professionnel'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-[#1A3C5E]/10 text-[#1A3C5E] px-2 py-1 rounded-full text-xs font-medium">
                      {tenant._count.contracts} contrat(s)
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