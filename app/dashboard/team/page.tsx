'use client';

import { useAuthStore } from '@/src/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/src/lib/api';
import DashboardLayout from '../components/DashboardLayout';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const roleLabel: Record<string, string> = {
  ADMIN: 'Administrateur',
  SECRETAIRE: 'Secrétaire',
  COMPTABLE: 'Comptable',
};

const roleColor: Record<string, string> = {
  ADMIN: 'bg-[#1A3C5E] text-white',
  SECRETAIRE: 'bg-blue-100 text-blue-700',
  COMPTABLE: 'bg-purple-100 text-purple-700',
};

export default function TeamPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [resetInfo, setResetInfo] = useState<{ email: string; password: string } | null>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', role: 'SECRETAIRE',
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadTeam();
  }, [user]);

  async function loadTeam() {
    try {
      const res = await api.get('/team');
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post('/team', form);
      setShowForm(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', role: 'SECRETAIRE' });
      setResetInfo({ email: res.data.email, password: res.data.temporaryPassword });
      loadTeam();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la création');
    }
  }

  async function handleToggle(id: string) {
    try {
      await api.put(`/team/${id}/toggle-active`);
      loadTeam();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleResetPassword(id: string, email: string) {
    try {
      const res = await api.put(`/team/${id}/reset-password`);
      setResetInfo({ email, password: res.data.temporaryPassword });
    } catch (err) {
      console.error(err);
    }
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Équipe</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nouveau membre
        </button>
      </div>

      {resetInfo && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-800 font-medium text-sm">✅ Accès créé / réinitialisé</p>
          <p className="text-green-700 text-sm mt-1">Email : <strong>{resetInfo.email}</strong></p>
          <p className="text-green-700 text-sm">Mot de passe temporaire : <strong>{resetInfo.password}</strong></p>
          <button onClick={() => setResetInfo(null)}
            className="text-green-600 text-xs mt-2 underline">
            Fermer
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Nouveau membre</h3>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input required type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
              <input value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rôle *</label>
              <select value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="SECRETAIRE">Secrétaire</option>
                <option value="COMPTABLE">Comptable</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                Annuler
              </button>
              <button type="submit"
                className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Créer le compte
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement...</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Aucun membre dans l'équipe</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Membre</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Rôle</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Statut</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1A3C5E]/10 rounded-full flex items-center justify-center text-xs font-bold text-[#1A3C5E]">
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{member.firstName} {member.lastName}</p>
                        <p className="text-slate-400 text-xs">{member.phone || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{member.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor[member.role]}`}>
                      {roleLabel[member.role]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {member.isActive ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleToggle(member.id)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${member.isActive ? 'bg-red-50 hover:bg-red-100 text-red-700' : 'bg-green-50 hover:bg-green-100 text-green-700'}`}>
                        {member.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                      <button onClick={() => handleResetPassword(member.id, member.email)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-medium transition-colors">
                        Réinitialiser MDP
                      </button>
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