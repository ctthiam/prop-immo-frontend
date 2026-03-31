'use client';

import { useAuthStore } from '@/src/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/src/lib/api';

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
];

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:   { label: 'En attente', className: 'bg-amber-100 text-amber-700' },
  PAID:      { label: 'Payé',       className: 'bg-green-100 text-green-700' },
  LATE:      { label: 'En retard',  className: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Annulé',     className: 'bg-slate-100 text-slate-500' },
};

export default function LocataireDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/locataire/login'); return; }
    if (user.role !== 'LOCATAIRE') { router.push('/login'); return; }
    loadDashboard();
  }, [user]);

  async function loadDashboard() {
    try {
      const res = await api.get('/tenants/portal/dashboard');
      setTenant(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function downloadQuittance(paymentId: string, reference: string) {
    try {
      const res = await api.get(`/rent-payments/${paymentId}/quittance`);
      const { pdfBase64, filename } = res.data;
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      link.download = filename;
      link.click();
    } catch (err) {
      console.error(err);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-[#1A3C5E] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">PropAfric</h1>
          <p className="text-slate-300 text-xs">Espace Locataire</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 text-sm">{user.firstName} {user.lastName}</span>
          <button onClick={() => { logout(); router.push('/locataire/login'); }}
            className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors">
            Déconnexion
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center text-slate-500 py-20">Chargement...</div>
        ) : !tenant ? (
          <div className="text-center text-slate-500 py-20">Données introuvables</div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                Bonjour, {tenant.firstName} {tenant.lastName}
              </h2>
              <p className="text-slate-500 mt-1">Voici votre espace locataire</p>
            </div>

            {tenant.contracts.map((contract: any) => (
              <div key={contract.id}>
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Mon logement</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Bien</p>
                      <p className="font-medium text-slate-800">{contract.property.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Type</p>
                      <p className="font-medium text-slate-800">{contract.property.type}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-slate-500">Adresse</p>
                      <p className="font-medium text-slate-800">{contract.property.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Loyer mensuel TTC</p>
                      <p className="font-bold text-[#1A3C5E] text-xl">
                        {contract.rentTTC.toLocaleString('fr-FR')} F
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Référence contrat</p>
                      <p className="font-mono text-sm text-slate-600">{contract.reference}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Historique des loyers
                  </h3>
                  {contract.rentPayments.length === 0 ? (
                    <p className="text-slate-500 text-sm">Aucun paiement enregistré</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-slate-500 font-medium">Période</th>
                          <th className="text-left py-3 px-4 text-slate-500 font-medium">Montant</th>
                          <th className="text-left py-3 px-4 text-slate-500 font-medium">Statut</th>
                          <th className="text-left py-3 px-4 text-slate-500 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contract.rentPayments.map((payment: any) => (
                          <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-700">
                              {MONTHS[payment.month - 1]} {payment.year}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {payment.amount.toLocaleString('fr-FR')} F
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[payment.status]?.className}`}>
                                {statusConfig[payment.status]?.label}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {payment.status === 'PAID' && (
                                <button
                                  onClick={() => downloadQuittance(payment.id, payment.reference)}
                                  className="bg-[#1A3C5E]/10 hover:bg-[#1A3C5E]/20 text-[#1A3C5E] px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                                  🧾 Quittance
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}