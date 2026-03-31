'use client';

import { useAuthStore } from '@/src/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/src/lib/api';
import DashboardLayout from '../components/DashboardLayout';

interface RentPayment {
  id: string;
  reference: string;
  amount: number;
  month: number;
  year: number;
  dueDate: string;
  paidAt: string | null;
  paymentMethod: string | null;
  status: string;
  contract: {
    reference: string;
    tenant: { firstName: string; lastName: string; phone: string };
    property: { name: string; address: string };
  };
}

interface Contract {
  id: string;
  reference: string;
  tenant: { firstName: string; lastName: string };
  property: { name: string };
}

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
];

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payForm, setPayForm] = useState({ paidAt: '', paymentMethod: 'Espèces' });
  const [form, setForm] = useState({
    contractId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    dueDate: '',
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadData();
  }, [user]);

  async function loadData() {
    try {
      const [paymentsRes, contractsRes] = await Promise.all([
        api.get('/rent-payments'),
        api.get('/contracts'),
      ]);
      setPayments(paymentsRes.data);
      setContracts(contractsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePayment(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/rent-payments', form);
      setShowForm(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la création');
    }
  }

  async function handleRecordPayment(id: string) {
    try {
      await api.put(`/rent-payments/${id}/pay`, payForm);
      setPayingId(null);
      setPayForm({ paidAt: '', paymentMethod: 'Espèces' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function downloadQuittancePdf(paymentId: string, reference: string) {
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

  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING:   { label: 'En attente', className: 'bg-amber-100 text-amber-700' },
    PAID:      { label: 'Payé',       className: 'bg-green-100 text-green-700' },
    LATE:      { label: 'En retard',  className: 'bg-red-100 text-red-700' },
    CANCELLED: { label: 'Annulé',     className: 'bg-slate-100 text-slate-500' },
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Loyers & Paiements</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nouvelle échéance
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Nouvelle échéance de loyer</h3>
          <form onSubmit={handleCreatePayment} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Contrat *</label>
              <select required value={form.contractId}
                onChange={(e) => setForm({ ...form, contractId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sélectionner un contrat...</option>
                {contracts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.property.name} — {c.tenant.firstName} {c.tenant.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mois *</label>
              <select value={form.month}
                onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {MONTHS.map((m, i) => (
                  <option key={i+1} value={i+1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Année *</label>
              <input type="number" value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date d'échéance *</label>
              <input required type="date" value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                Annuler
              </button>
              <button type="submit"
                className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Créer l'échéance
              </button>
            </div>
          </form>
        </div>
      )}

      {payingId && (
        <div className="bg-white rounded-xl border border-blue-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Enregistrer le paiement</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date de paiement *</label>
              <input type="date" value={payForm.paidAt}
                onChange={(e) => setPayForm({ ...payForm, paidAt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mode de paiement *</label>
              <select value={payForm.paymentMethod}
                onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Espèces</option>
                <option>Chèque</option>
                <option>Virement bancaire</option>
                <option>Wave</option>
                <option>Orange Money</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-3 justify-end">
              <button onClick={() => setPayingId(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                Annuler
              </button>
              <button onClick={() => handleRecordPayment(payingId)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Confirmer le paiement
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Aucun paiement enregistré</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Référence</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Locataire</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Bien</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Période</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Montant</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Statut</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">{payment.reference}</td>
                  <td className="py-3 px-4 text-slate-800">
                    {payment.contract.tenant.firstName} {payment.contract.tenant.lastName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{payment.contract.property.name}</td>
                  <td className="py-3 px-4 text-slate-600">
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
                    {payment.status === 'PENDING' || payment.status === 'LATE' ? (
                      <button
                        onClick={() => setPayingId(payment.id)}
                        className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                        Encaisser
                      </button>
                    ) : payment.status === 'PAID' ? (
                      <button
                        onClick={() => downloadQuittancePdf(payment.id, payment.reference)}
                        className="bg-[#1A3C5E]/10 hover:bg-[#1A3C5E]/20 text-[#1A3C5E] px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                        🧾 Quittance PDF
                      </button>
                    ) : null}
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