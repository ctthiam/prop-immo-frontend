'use client';

import { useRouter } from 'next/navigation';

const menuItems = [
  { label: 'Tableau de bord', href: '/dashboard', icon: '📊' },
  { label: 'Propriétaires', href: '/dashboard/owners', icon: '👤' },
  { label: 'Locataires', href: '/dashboard/tenants', icon: '🏠' },
  { label: 'Biens', href: '/dashboard/properties', icon: '🏢' },
  { label: 'Contrats', href: '/dashboard/contracts', icon: '📄' },
  { label: 'Loyers', href: '/dashboard/payments', icon: '💰' },
  { label: 'Relevés', href: '/dashboard/statements', icon: '📊' },
  { label: 'Travaux', href: '/dashboard/works', icon: '🔧' },
  { label: 'Prestataires', href: '/dashboard/providers', icon: '👷' },
  { label: 'Messagerie', href: '/dashboard/messages', icon: '💬' },
  { label: 'Équipe', href: '/dashboard/team', icon: '👥' },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 px-4 py-6">
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}