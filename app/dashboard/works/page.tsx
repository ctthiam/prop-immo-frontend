'use client';

import { useAuthStore } from '@/src/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/src/lib/api';
import DashboardLayout from '../components/DashboardLayout';

interface WorkOrder {
  id: string;
  reference: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  cost: number | null;
  property: { id: string; name: string; address: string };
  provider: { id: string; name: string; type: string; phone: string } | null;
}

interface Property {
  id: string;
  name: string;
}

interface Provider {
  id: string;
  name: string;
  type: string;
  phone: string;
}

export default function WorksPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [cost, setCost] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'NORMAL',
    propertyId: '',
    providerId: '',
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadData();
  }, [user]);

  async function loadData() {
    try {
      const [worksRes, propsRes, providersRes] = await Promise.all([
        api.get('/work-orders'),
        api.get('/properties'),
        api.get('/providers'),
      ]);
      setWorkOrders(worksRes.data);
      setProperties(propsRes.data);
      setProviders(providersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/work-orders', form);
      setShowForm(false);
      setForm({ title: '', description: '', priority: 'NORMAL', propertyId: '', providerId: '' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAssign(id: string) {
    try {
      await api.put(`/work-orders/${id}/assign`, { providerId: selectedProvider });
      setAssigningId(null);
      setSelectedProvider('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleComplete(id: string) {
    try {
      await api.put(`/work-orders/${id}/complete`, { cost: parseFloat(cost) });
      setCompletingId(null);
      setCost('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING:     { label: 'En attente',  className: 'bg-amber-100 text-amber-700' },
    ASSIGNED:    { label: 'Assigné',     className: 'bg-blue-100 text-blue-700' },
    IN_PROGRESS: { label: 'En cours',    className: 'bg-purple-100 text-purple-700' },
    COMPLETED:   { label: 'Terminé',     className: 'bg-green-100 text-green-700' },
    CANCELLED:   { label: 'Annulé',      className: 'bg-slate-100 text-slate-500' },
  };

  const priorityConfig: Record<string, { label: string; className: string }> = {
    LOW:    { label: 'Basse',   className: 'bg-slate-100 text-slate-600' },
    NORMAL: { label: 'Normale', className: 'bg-blue-100 text-blue-600' },
    HIGH:   { label: 'Haute',   className: 'bg-orange-100 text-orange-600' },
    URGENT: { label: 'Urgent',  className: 'bg-red-100 text-red-600' },
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Travaux & Interventions</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nouveau travail
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Nouveau travail</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
              <input required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Fuite d'eau salle de bain"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
              <textarea required value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bien *</label>
              <select required value={form.propertyId}
                onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sélectionner un bien...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priorité</label>
              <select value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="LOW">Basse</option>
                <option value="NORMAL">Normale</option>
                <option value="HIGH">Haute</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prestataire (optionnel)</label>
              <select value={form.providerId}
                onChange={(e) => setForm({ ...form, providerId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Assigner plus tard...</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                Annuler
              </button>
              <button type="submit"
                className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Créer
              </button>
            </div>
          </form>
        </div>
      )}

      {assigningId && (
        <div className="bg-white rounded-xl border border-blue-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Assigner un prestataire</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Prestataire *</label>
              <select value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sélectionner...</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type}) — {p.phone}</option>
                ))}
              </select>
            </div>
            <button onClick={() => handleAssign(assigningId)}
              disabled={!selectedProvider}
              className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              Assigner
            </button>
            <button onClick={() => setAssigningId(null)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
              Annuler
            </button>
          </div>
        </div>
      )}

      {completingId && (
        <div className="bg-white rounded-xl border border-green-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Marquer comme terminé</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Coût des travaux (FCFA)</label>
              <input type="number" value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={() => handleComplete(completingId)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Confirmer
            </button>
            <button onClick={() => setCompletingId(null)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement...</div>
        ) : workOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Aucun travail enregistré</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Référence</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Titre</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Bien</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Prestataire</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Priorité</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Statut</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((work) => (
                <tr key={work.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">{work.reference}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800">{work.title}</p>
                    <p className="text-slate-400 text-xs truncate max-w-32">{work.description}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{work.property.name}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {work.provider ? (
                      <div>
                        <p className="font-medium">{work.provider.name}</p>
                        <p className="text-xs text-slate-400">{work.provider.type}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[work.priority]?.className}`}>
                      {priorityConfig[work.priority]?.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[work.status]?.className}`}>
                      {statusConfig[work.status]?.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {work.status === 'PENDING' && (
                        <button onClick={() => setAssigningId(work.id)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                          Assigner
                        </button>
                      )}
                      {(work.status === 'ASSIGNED' || work.status === 'IN_PROGRESS') && (
                        <button onClick={() => setCompletingId(work.id)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          Terminer
                        </button>
                      )}
                      {work.status === 'COMPLETED' && work.cost && (
                        <span className="text-slate-500 text-xs">
                          {work.cost.toLocaleString('fr-FR')} F
                        </span>
                      )}
                    </div>
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