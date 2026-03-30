'use client';

import { useAuthStore } from '@/src/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/src/lib/api';
import DashboardLayout from '../components/DashboardLayout';

interface Contract {
  id: string;
  reference: string;
  type: string;
  startDate: string;
  rentBase: number;
  rentTTC: number;
  status: string;
  property: { id: string; name: string; address: string; type: string };
  tenant: { id: string; firstName: string; lastName: string; phone: string };
}

interface Property {
  id: string;
  name: string;
  status: string;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
}

export default function ContractsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'HABITATION',
    startDate: '',
    rentBase: '',
    charges: '0',
    managementFeePercent: '8',
    taxPercent: '3.6',
    deposit: '0',
    propertyId: '',
    tenantId: '',
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadData();
  }, [user]);

  async function loadData() {
    try {
      const [contractsRes, propsRes, tenantsRes] = await Promise.all([
        api.get('/contracts'),
        api.get('/properties'),
        api.get('/tenants'),
      ]);
      setContracts(contractsRes.data);
      setProperties(propsRes.data.filter((p: Property) => p.status === 'VACANT'));
      setTenants(tenantsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/contracts', {
        ...form,
        rentBase: parseFloat(form.rentBase),
        charges: parseFloat(form.charges),
        managementFeePercent: parseFloat(form.managementFeePercent),
        taxPercent: parseFloat(form.taxPercent),
        deposit: parseFloat(form.deposit),
      });
      setShowForm(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    ACTIVE:     { label: 'Actif',     className: 'bg-green-100 text-green-700' },
    RENEWED:    { label: 'Renouvelé', className: 'bg-blue-100 text-blue-700' },
    NOTICE:     { label: 'Préavis',   className: 'bg-amber-100 text-amber-700' },
    TERMINATED: { label: 'Résilié',   className: 'bg-red-100 text-red-700' },
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Contrats de bail</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nouveau contrat
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Nouveau contrat</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bien *</label>
              <select required value={form.propertyId}
                onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sélectionner un bien vacant...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Locataire *</label>
              <select required value={form.tenantId}
                onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sélectionner un locataire...</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
              <select value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="HABITATION">Habitation</option>
                <option value="PROFESSIONNEL">Professionnel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date de début *</label>
              <input required type="date" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loyer de base (FCFA) *</label>
              <input required type="number" value={form.rentBase}
                onChange={(e) => setForm({ ...form, rentBase: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Charges (FCFA)</label>
              <input type="number" value={form.charges}
                onChange={(e) => setForm({ ...form, charges: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Frais de gestion (%)</label>
              <input type="number" step="0.1" value={form.managementFeePercent}
                onChange={(e) => setForm({ ...form, managementFeePercent: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">TOM (%)</label>
              <input type="number" step="0.1" value={form.taxPercent}
                onChange={(e) => setForm({ ...form, taxPercent: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Caution (FCFA)</label>
              <input type="number" value={form.deposit}
                onChange={(e) => setForm({ ...form, deposit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                Annuler
              </button>
              <button type="submit"
                className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Créer le contrat
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement...</div>
        ) : contracts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Aucun contrat enregistré</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Référence</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Bien</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Locataire</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Loyer TTC</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">{contract.reference}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800">{contract.property.name}</p>
                    <p className="text-slate-400 text-xs">{contract.property.type}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {contract.tenant.firstName} {contract.tenant.lastName}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {contract.rentTTC.toLocaleString('fr-FR')} F
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[contract.status]?.className}`}>
                      {statusConfig[contract.status]?.label}
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