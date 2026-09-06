'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, CreditCard, ArrowRight } from 'lucide-react';
import { adminData } from '@/lib/admin/adminData';
import { AdminBarbershopRow, SubscriptionStatus } from '@/types';
import { formatCurrency, formatDateBR } from '@/lib/utils/formatters';
import { StatusBadge, ExpiryBadge, AdminLoading, EmptyState, StatCard } from '@/components/admin/AdminUI';

type StatusFilter = 'ALL' | SubscriptionStatus;

const filters: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'Todas' },
  { value: 'ACTIVE', label: 'Ativas' },
  { value: 'TRIAL', label: 'Em teste' },
  { value: 'EXPIRED', label: 'Vencidas' },
  { value: 'SUSPENDED', label: 'Suspensas' },
  { value: 'CANCELLED', label: 'Canceladas' },
];

export default function AdminAssinaturasPage() {
  const [rows, setRows] = useState<AdminBarbershopRow[] | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');

  useEffect(() => {
    setRows(adminData.listRows());
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const term = search.trim().toLowerCase();
    return rows
      .filter((r) => (status === 'ALL' ? true : r.subscription.status === status))
      .filter((r) => (term ? r.barbershop.name.toLowerCase().includes(term) : true))
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [rows, search, status]);

  if (!rows) return <AdminLoading label="Carregando assinaturas..." />;

  const mrr = rows
    .filter((r) => r.subscription.status === 'ACTIVE')
    .reduce((sum, r) => sum + (r.plan?.price || 0), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-purple-400" /> Assinaturas
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Controle manual de todas as assinaturas da plataforma.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total de assinaturas" value={rows.length} accent="purple" />
        <StatCard
          label="Receita recorrente (MRR)"
          value={formatCurrency(mrr)}
          hint="Somatório dos planos ativos"
          accent="emerald"
        />
        <StatCard
          label="Contas bloqueadas"
          value={rows.filter((r) => !r.hasAccess).length}
          hint="Vencidas, suspensas ou canceladas"
          accent="red"
        />
      </div>

      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pelo nome da barbearia..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const count =
              f.value === 'ALL' ? rows.length : rows.filter((r) => r.subscription.status === f.value).length;
            const isActive = status === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  isActive
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-100 hover:border-slate-700'
                }`}
              >
                {f.label} <span className={isActive ? 'text-purple-100' : 'text-slate-600'}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          rows.length === 0 ? (
            <EmptyState
              message="Nenhuma assinatura ainda."
              hint="Cada barbearia cadastrada gera uma assinatura automaticamente."
            />
          ) : (
            <EmptyState message="Nenhuma assinatura encontrada." hint="Ajuste a busca ou os filtros." />
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-900/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Barbearia</th>
                  <th className="p-4 hidden sm:table-cell">Responsável</th>
                  <th className="p-4">Plano</th>
                  <th className="p-4 hidden md:table-cell">Valor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 hidden lg:table-cell">Início</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4">Dias restantes</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((row) => (
                  <tr key={row.subscription.id} className="hover:bg-slate-900/40">
                    <td className="p-4 font-semibold text-white">{row.barbershop.name}</td>
                    <td className="p-4 text-slate-300 hidden sm:table-cell">{row.ownerName}</td>
                    <td className="p-4 font-semibold text-amber-400">{row.plan?.name}</td>
                    <td className="p-4 text-slate-200 font-mono text-xs hidden md:table-cell">
                      {formatCurrency(row.plan?.price || 0)}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={row.subscription.status} />
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-400 hidden lg:table-cell">
                      {formatDateBR(row.subscription.startsAt)}
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-300">
                      {formatDateBR(row.subscription.currentPeriodEnd)}
                    </td>
                    <td className="p-4">
                      <ExpiryBadge daysRemaining={row.daysRemaining} hasAccess={row.hasAccess} />
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/barbearias/${row.barbershop.id}`}
                        className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 text-xs font-semibold"
                      >
                        Gerenciar <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
