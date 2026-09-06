'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  PauseCircle,
  XCircle,
  TrendingUp,
  CalendarClock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { adminData } from '@/lib/admin/adminData';
import { formatCurrency, formatDateBR } from '@/lib/utils/formatters';
import { StatCard, StatusBadge, ExpiryBadge, AdminLoading, EmptyState } from '@/components/admin/AdminUI';

type Metrics = ReturnType<typeof adminData.getDashboardMetrics>;

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    setMetrics(adminData.getDashboardMetrics());
  }, []);

  if (!metrics) return <AdminLoading label="Carregando métricas da plataforma..." />;

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/30">
            Administração BarberFlow
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Visão geral da plataforma</h1>
        <p className="text-sm text-slate-400 mt-1">
          Situação de todas as barbearias, assinaturas e vencimentos do BarberFlow.
        </p>
      </header>

      {/* Cards principais */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Barbearias cadastradas"
          value={metrics.total}
          hint={`${metrics.newLast30Days} novas nos últimos 30 dias`}
          icon={Building2}
          accent="purple"
        />
        <StatCard
          label="Assinaturas ativas"
          value={metrics.active}
          hint={`Receita recorrente: ${formatCurrency(metrics.mrr)}`}
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          label="Em período de teste"
          value={metrics.trial}
          hint="Contas ainda no trial"
          icon={Clock3}
          accent="blue"
        />
        <StatCard
          label="Assinaturas vencidas"
          value={metrics.expired}
          hint="Acesso bloqueado ao painel"
          icon={AlertTriangle}
          accent="red"
        />
        <StatCard
          label="Contas suspensas"
          value={metrics.suspended}
          hint="Suspensas pela administração"
          icon={PauseCircle}
          accent="gold"
        />
        <StatCard
          label="Assinaturas canceladas"
          value={metrics.cancelled}
          hint="Dados preservados"
          icon={XCircle}
          accent="slate"
        />
      </section>

      {/* Alertas de vencimento */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-red-500/30 bg-red-500/5">
          <span className="text-xs font-semibold text-red-300 uppercase tracking-wider">Vencendo hoje</span>
          <div className="text-3xl font-extrabold text-red-400 mt-2">{metrics.expiringToday}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Próximos 3 dias</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">{metrics.expiringIn3Days}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-blue-500/30 bg-blue-500/5">
          <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Próximos 7 dias</span>
          <div className="text-3xl font-extrabold text-blue-400 mt-2">{metrics.expiringIn7Days}</div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vencendo em breve */}
        <section className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-3">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
              <CalendarClock className="w-4 h-4 text-amber-400" /> Assinaturas próximas do vencimento
            </h2>
            <Link href="/admin/assinaturas" className="text-xs text-purple-400 hover:underline font-semibold shrink-0">
              Ver todas
            </Link>
          </div>
          {metrics.expiringSoon.length === 0 ? (
            <EmptyState message="Nenhuma assinatura vence nos próximos 7 dias." />
          ) : (
            <ul className="divide-y divide-slate-800/80">
              {metrics.expiringSoon.slice(0, 6).map((row) => (
                <li key={row.barbershop.id}>
                  <Link
                    href={`/admin/barbearias/${row.barbershop.id}`}
                    className="flex items-center justify-between gap-3 p-4 hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-white text-sm truncate">{row.barbershop.name}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {row.plan?.name} · vence em {formatDateBR(row.subscription.currentPeriodEnd)}
                      </div>
                    </div>
                    <ExpiryBadge daysRemaining={row.daysRemaining} hasAccess={row.hasAccess} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Vencidas recentemente */}
        <section className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Vencidas recentemente
            </h2>
          </div>
          {metrics.recentlyExpired.length === 0 ? (
            <EmptyState message="Nenhuma assinatura vencida nos últimos 30 dias." />
          ) : (
            <ul className="divide-y divide-slate-800/80">
              {metrics.recentlyExpired.slice(0, 6).map((row) => (
                <li key={row.barbershop.id}>
                  <Link
                    href={`/admin/barbearias/${row.barbershop.id}`}
                    className="flex items-center justify-between gap-3 p-4 hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-white text-sm truncate">{row.barbershop.name}</div>
                      <div className="text-xs text-slate-500 truncate">{row.ownerName}</div>
                    </div>
                    <StatusBadge status={row.subscription.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Últimas barbearias cadastradas */}
      <section className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-3">
          <h2 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
            <Sparkles className="w-4 h-4 text-purple-400" /> Últimas barbearias cadastradas
          </h2>
          <Link href="/admin/barbearias" className="text-xs text-purple-400 hover:underline font-semibold shrink-0">
            Ver todas
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Barbearia</th>
                <th className="p-4 hidden sm:table-cell">Responsável</th>
                <th className="p-4 hidden md:table-cell">Cidade</th>
                <th className="p-4">Plano</th>
                <th className="p-4">Status</th>
                <th className="p-4 hidden lg:table-cell">Cadastro</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {metrics.recentShops.map((row) => (
                <tr key={row.barbershop.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-semibold text-white">{row.barbershop.name}</td>
                  <td className="p-4 text-slate-300 hidden sm:table-cell">{row.ownerName}</td>
                  <td className="p-4 text-slate-400 hidden md:table-cell">
                    {row.barbershop.city}/{row.barbershop.state}
                  </td>
                  <td className="p-4 text-amber-400 font-semibold">{row.plan?.name}</td>
                  <td className="p-4">
                    <StatusBadge status={row.subscription.status} />
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-xs hidden lg:table-cell">
                    {formatDateBR(row.barbershop.createdAt)}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/barbearias/${row.barbershop.id}`}
                      className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap"
                    >
                      Detalhes <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
