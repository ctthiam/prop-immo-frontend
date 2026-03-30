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
}

interface Property {
  id: string;
  type: string;
  name: string;
  address: string;
  rentBase: number;
  status: string;
  owner: Owner;
  _count: { contracts: number };
}

export default function PropertiesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'Appartement', name: '', address: '',
    description: '', rentBase: '', ownerId: '',
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadData();
  }, [user]);

  async function loadData() {
    try {
      const [propsRes, ownersRes] = await Promise.all([
        api.get('/properties'),
        api.get('/owners'),
      ]);
      setProperties(propsRes.data);
      setOwners(ownersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/properties', {
        ...form,
        rentBase: parseFloat(form.rentBase),
      });
      setShowForm(false);
      setForm({ type: 'Appartement', name: '', address: '', description: '', rentBase: '', ownerId: '' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  const statusLabel: Record<string, { label: string; className: string }> = {
    VACANT:   { label: 'Vacant',  className: 'bg-amber-100 text-amber-700' },
    OCCUPIED: { label: 'Occupé',  className: 'bg-green-100 text-green-700' },
    ARCHIVED: { label: 'Archivé', className: 'bg-slate-100 text-slate-500' },
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Biens immobiliers</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nouveau bien
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Nouveau bien</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
              <select value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['Appartement','Studio','Villa','Duplex','Bureau','Local commercial',
                  'Entrepôt','Terrain','Immeuble','Chambre'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
              <input required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Appt RDC - Liberté 6"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Adresse *</label>
              <input required value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loyer de base (FCFA) *</label>
              <input required type="number" value={form.rentBase}
                onChange={(e) => setForm({ ...form, rentBase: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Propriétaire *</label>
              <select required value={form.ownerId}
                onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sélectionner...</option>
                {owners.map(o => (
                  <option key={o.id} value={o.id}>{o.firstName} {o.lastName}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
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
        ) : properties.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Aucun bien enregistré</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Bien</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Propriétaire</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Loyer base</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800">{property.name}</p>
                    <p className="text-slate-400 text-xs">{property.address}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{property.type}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {property.owner.firstName} {property.owner.lastName}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {property.rentBase.toLocaleString('fr-FR')} F
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabel[property.status]?.className}`}>
                      {statusLabel[property.status]?.label}
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