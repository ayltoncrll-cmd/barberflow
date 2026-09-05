'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Building, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Scissors, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockStore } from '@/lib/store/mockStore';
import { formatCurrency } from '@/lib/utils/formatters';

export default function SuperAdminPage() {
  const [search, setSearch] = useState('');
  const [shop, setShop] = useState(mockStore.getBarbershop());
  const [profsCount, setProfsCount] = useState(0);
  const [appsCount, setAppsCount] = useState(0);

  useEffect(() => {
    const s = mockStore.getBarbershop();
    setShop(s);
    setProfsCount(mockStore.getProfessionals().length);
    setAppsCount(mockStore.getAppointments().length);
  }, []);

  const tenants = [
    {
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      owner: 'Proprietário',
      plan: 'Pro',
      price: 129.90,
      status: 'ACTIVE',
      professionalsCount: profsCount,
      appointmentsMonth: appsCount,
      createdAt: shop.createdAt,
    },
  ];

  const filteredTenants = tenants.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.owner.toLowerCase().includes(search.toLowerCase())
  );

  const mrr = tenants.reduce((acc, curr) => acc + (curr.status === 'ACTIVE' ? curr.price : 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-purple-500/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
              Super Admin SaaS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" /> Painel de Administração BarberFlow
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Métricas da plataforma SaaS, tenants cadastrados, assinaturas e receita recorrente (MRR).
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard da Barbearia
          </Button>
        </Link>
      </div>

      {/* SaaS Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Receita Recorrente (MRR)</span>
          <div className="text-3xl font-extrabold text-purple-400 mt-2 font-mono">{formatCurrency(mrr)}</div>
          <div className="text-xs text-purple-300 mt-2 font-medium">Plano Pro Ativo</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Barbearias Cadastradas</span>
          <div className="text-3xl font-extrabold text-white mt-2">{tenants.length} tenant</div>
          <div className="text-xs text-emerald-400 mt-2">Ambiente isolado ativo</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Barbeiros Ativos no SaaS</span>
          <div className="text-3xl font-extrabold text-white mt-2">{profsCount} barbeiros</div>
          <div className="text-xs text-slate-400 mt-2">Cadastrados no seu tenant</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assinatura do Tenant</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">Plano Pro</div>
          <div className="text-xs text-emerald-400 mt-2">Ativo e regular</div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-purple-400" /> Barbearias / Tenants Cadastrados
          </h2>
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar barbearia..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Barbearia</th>
                <th className="p-4">Dono / Responsável</th>
                <th className="p-4">Plano</th>
                <th className="p-4">Status Assinatura</th>
                <th className="p-4">Barbeiros</th>
                <th className="p-4">Agendamentos</th>
                <th className="p-4">Link Público</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                    {t.name}
                  </td>
                  <td className="p-4 text-slate-300">{t.owner}</td>
                  <td className="p-4">
                    <span className="font-bold text-amber-400">{t.plan}</span> ({formatCurrency(t.price)}/mês)
                  </td>
                  <td className="p-4">
                    <Badge variant="emerald">Ativo</Badge>
                  </td>
                  <td className="p-4 font-mono font-semibold text-slate-200">{t.professionalsCount}</td>
                  <td className="p-4 font-mono font-semibold text-slate-200">{t.appointmentsMonth}</td>
                  <td className="p-4">
                    <a
                      href={`/barbearia/${t.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline flex items-center gap-1 text-xs font-semibold"
                    >
                      Ver Página <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
