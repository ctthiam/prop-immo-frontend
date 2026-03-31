'use client';

import { useAuthStore } from '@/src/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/src/lib/api';

interface WorkOrder {
  id: string;
  reference: string;
  title: string;
  status: string;
  priority: string;
}

interface Contract {
  id: string;
  reference: string;
  rentTTC: number;
  status: string;
  tenant: { firstName: string; lastName: string; phone: string };
  rentPayments: { amount: number; paidAt: string }[];
}

interface Property {
  id: string;
  name: string;
  type: string;
  address: string;
  status: string;
  rentBase: number;
  contracts: Contract[];
  workOrders: WorkOrder[];
}

export default function ProprietaireDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/proprietaire/login'); return; }
    if (user.role !== 'PROPRIETAIRE') { router.push('/login'); return; }
    loadDashboard();
  }, [user]);

  async function loadDashboard() {
    try {
      const res = await api.get('/owners/portal/dashboard');
      setOwner(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const statusLabel: Record<string, { label: string; className: string }> = {
    VACANT:   { label: 'Vacant',  className: 'bg-amber-100 text-amber-700' },
    OCCUPIED: { label: 'Occupé',  className: 'bg-green-100 text-green-700' },
    ARCHIVED: { label: 'Archivé', className: 'bg-slate-100 text-slate-500' },
  };

  const workStatusLabel: Record<string, { label: string; className: string }> = {
    PENDING:     { label: 'En attente', className: 'bg-amber-100 text-amber-700' },
    ASSIGNED:    { label: 'Assigné',    className: 'bg-blue-100 text-blue-700' },
    IN_PROGRESS: { label: 'En cours',   className: 'bg-purple-100 text-purple-700' },
    COMPLETED:   { label: 'Terminé',    className: 'bg-green-100 text-green-700' },
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-[#1A3C5E] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">PropAfric</h1>
          <p className="text-slate-300 text-xs">Espace Propriétaire</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 text-sm">{user.firstName} {user.lastName}</span>
          <button onClick={() => { logout(); router.push('/proprietaire/login'); }}
            className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors">
            Déconnexion
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center text-slate-500 py-20">Chargement...</div>
        ) : !owner ? (
          <div className="text-center text-slate-500 py-20">Données introuvables</div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                Bonjour, {owner.firstName} {owner.lastName}
              </h2>
              <p className="text-slate-500 mt-1">Voici le tableau de bord de votre patrimoine</p>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500 mb-1">Biens</p>
                <p className="text-3xl font-bold text-[#1A3C5E]">{owner.properties.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500 mb-1">Biens occupés</p>
                <p className="text-3xl font-bold text-green-600">
                  {owner.properties.filter((p: Property) => p.status === 'OCCUPIED').length}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500 mb-1">Travaux en cours</p>
                <p className="text-3xl font-bold text-[#D4A843]">
                  {owner.properties.reduce((sum: number, p: Property) => sum + p.workOrders.length, 0)}
                </p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mb-4">Mes biens</h3>
            <div className="space-y-4">
              {owner.properties.map((property: Property) => (
                <div key={property.id} className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-lg">{property.name}</h4>
                      <p className="text-slate-500 text-sm">{property.address}</p>
                      <p className="text-slate-400 text-xs mt-1">{property.type}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabel[property.status]?.className}`}>
                      {statusLabel[property.status]?.label}
                    </span>
                  </div>

                  {property.contracts.length > 0 && (
                    <div className="border-t border-slate-100 pt-4 mb-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Locataire actuel</p>
                      {property.contracts.map((contract: Contract) => (
                        <div key={contract.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                          <div>
                            <p className="font-medium text-slate-800 text-sm">
                              {contract.tenant.firstName} {contract.tenant.lastName}
                            </p>
                            <p className="text-slate-500 text-xs">{contract.tenant.phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-slate-800 text-sm">
                              {contract.rentTTC.toLocaleString('fr-FR')} F/mois
                            </p>
                            <p className="text-slate-400 text-xs">Loyer TTC</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {property.workOrders.length > 0 && (
                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Travaux en cours</p>
                      <div className="space-y-2">
                        {property.workOrders.map((work: WorkOrder) => (
                          <div key={work.id} className="flex items-center justify-between">
                            <p className="text-sm text-slate-700">{work.title}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${workStatusLabel[work.status]?.className}`}>
                              {workStatusLabel[work.status]?.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}