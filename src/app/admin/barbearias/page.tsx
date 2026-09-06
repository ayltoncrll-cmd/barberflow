'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, ArrowRight, Building2, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { adminData } from '@/lib/admin/adminData';
import { AdminBarbershopRow, SaaSPlan, SubscriptionStatus } from '@/types';
import { formatDateBR } from '@/lib/utils/formatters';
import { SUBSCRIPTION_STATUS_LABEL, dateInputToISO, isoToDateInput, addDays } from '@/lib/utils/subscription';
import { StatusBadge, ExpiryBadge, AdminLoading, EmptyState, Toast, ToastState } from '@/components/admin/AdminUI';

type StatusFilter = 'ALL' | SubscriptionStatus;
type SortOption = 'RECENT' | 'OLDEST' | 'EXPIRY_ASC' | 'EXPIRY_DESC';

const sortLabels: Record<SortOption, string> = {
  RECENT: 'Cadastro mais recente',
  OLDEST: 'Cadastro mais antigo',
  EXPIRY_ASC: 'Vencimento mais próximo',
  EXPIRY_DESC: 'Vencimento mais distante',
};

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'Todas' },
  { value: 'ACTIVE', label: 'Ativas' },
  { value: 'TRIAL', label: 'Em teste' },
  { value: 'EXPIRED', label: 'Vencidas' },
  { value: 'SUSPENDED', label: 'Suspensas' },
  { value: 'CANCELLED', label: 'Canceladas' },
];

export default function AdminBarbeariasPage() {
  const [rows, setRows] = useState<AdminBarbershopRow[] | null>(null);
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [sort, setSort] = useState<SortOption>('RECENT');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const reload = () => setRows(adminData.listRows());

  useEffect(() => {
    reload();
    setPlans(adminData.listPlans().filter((p) => p.active));
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const term = search.trim().toLowerCase();

    const result = rows.filter((row) => {
      if (status !== 'ALL' && row.subscription.status !== status) return false;
      if (!term) return true;
      const haystack = [
        row.barbershop.name,
        row.ownerName,
        row.barbershop.phone,
        row.barbershop.whatsapp || '',
        row.barbershop.email || '',
        row.barbershop.city,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });

    return result.sort((a, b) => {
      switch (sort) {
        case 'OLDEST':
          return new Date(a.barbershop.createdAt).getTime() - new Date(b.barbershop.createdAt).getTime();
        case 'EXPIRY_ASC':
          return a.daysRemaining - b.daysRemaining;
        case 'EXPIRY_DESC':
          return b.daysRemaining - a.daysRemaining;
        default:
          return new Date(b.barbershop.createdAt).getTime() - new Date(a.barbershop.createdAt).getTime();
      }
    });
  }, [rows, search, status, sort]);

  if (!rows) return <AdminLoading label="Carregando barbearias..." />;

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-400" /> Barbearias
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {rows.length} {rows.length === 1 ? 'barbearia cadastrada' : 'barbearias cadastradas'} na plataforma.
          </p>
        </div>
        <Button variant="gold" onClick={() => setModalOpen(true)} className="shrink-0">
          <Plus className="w-4 h-4" /> Nova Barbearia
        </Button>
      </header>

      {/* Busca, filtros e ordenação */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, responsável, telefone, e-mail ou cidade..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div className="relative lg:w-64">
            <SlidersHorizontal className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => {
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

      {/* Tabela */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            message="Nenhuma barbearia encontrada."
            hint="Ajuste a busca ou os filtros para ver outros resultados."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-900/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Barbearia</th>
                  <th className="p-4">Responsável</th>
                  <th className="p-4 hidden xl:table-cell">Contato</th>
                  <th className="p-4 hidden lg:table-cell">Cidade</th>
                  <th className="p-4">Plano</th>
                  <th className="p-4">Assinatura</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4 hidden xl:table-cell">Cadastro</th>
                  <th className="p-4">Conta</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((row) => (
                  <tr key={row.barbershop.id} className="hover:bg-slate-900/40">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {row.barbershop.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">{row.barbershop.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{row.ownerName}</td>
                    <td className="p-4 text-slate-400 hidden xl:table-cell">
                      <div className="text-xs">{row.barbershop.phone}</div>
                      <div className="text-xs text-slate-500">{row.barbershop.email}</div>
                    </td>
                    <td className="p-4 text-slate-400 hidden lg:table-cell">
                      {row.barbershop.city}/{row.barbershop.state}
                    </td>
                    <td className="p-4 font-semibold text-amber-400">{row.plan?.name}</td>
                    <td className="p-4">
                      <StatusBadge status={row.subscription.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-slate-300">
                          {formatDateBR(row.subscription.currentPeriodEnd)}
                        </span>
                        <ExpiryBadge daysRemaining={row.daysRemaining} hasAccess={row.hasAccess} />
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-400 hidden xl:table-cell">
                      {formatDateBR(row.barbershop.createdAt)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-semibold ${row.hasAccess ? 'text-emerald-400' : 'text-red-400'}`}
                      >
                        {row.hasAccess ? 'Liberada' : 'Bloqueada'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/barbearias/${row.barbershop.id}`}
                        className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 text-xs font-semibold"
                      >
                        Ver detalhes <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NovaBarbeariaModal
        isOpen={modalOpen}
        plans={plans}
        onClose={() => setModalOpen(false)}
        onCreated={(name) => {
          setModalOpen(false);
          reload();
          setToast({ type: 'success', message: `Barbearia "${name}" cadastrada com sucesso.` });
        }}
      />
    </div>
  );
}

function NovaBarbeariaModal({
  isOpen,
  plans,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  plans: SaaSPlan[];
  onClose: () => void;
  onCreated: (name: string) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    ownerName: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    planId: '',
    expiresAt: isoToDateInput(addDays(new Date(), 30)),
    status: 'ACTIVE' as SubscriptionStatus,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && plans.length && !form.planId) {
      setForm((f) => ({ ...f, planId: plans[0].id }));
    }
  }, [isOpen, plans, form.planId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.ownerName.trim() || !form.planId) {
      setError('Preencha o nome da barbearia, o responsável e o plano.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      adminData.createBarbershop({
        name: form.name.trim(),
        ownerName: form.ownerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        planId: form.planId,
        expiresAt: dateInputToISO(form.expiresAt),
        status: form.status,
      });
      setIsLoading(false);
      const created = form.name.trim();
      setForm({
        name: '',
        ownerName: '',
        phone: '',
        email: '',
        city: '',
        state: '',
        planId: plans[0]?.id || '',
        expiresAt: isoToDateInput(addDays(new Date(), 30)),
        status: 'ACTIVE',
      });
      onCreated(created);
    }, 500);
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm';
  const labelClass = 'block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Barbearia" maxWidth="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nome da barbearia *</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Barbearia do João"
            />
          </div>
          <div>
            <label className={labelClass}>Responsável *</label>
            <input
              className={inputClass}
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              placeholder="João da Silva"
            />
          </div>
          <div>
            <label className={labelClass}>Telefone / WhatsApp</label>
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(11) 99999-8888"
            />
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="contato@barbearia.com"
            />
          </div>
          <div className="grid grid-cols-3 gap-3 sm:col-span-2">
            <div className="col-span-2">
              <label className={labelClass}>Cidade</label>
              <input
                className={inputClass}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="São Paulo"
              />
            </div>
            <div>
              <label className={labelClass}>UF</label>
              <input
                className={`${inputClass} text-center uppercase`}
                maxLength={2}
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                placeholder="SP"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div>
            <label className={labelClass}>Plano *</label>
            <select
              className={inputClass}
              value={form.planId}
              onChange={(e) => setForm({ ...form, planId: e.target.value })}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as SubscriptionStatus })}
            >
              {(['ACTIVE', 'TRIAL'] as SubscriptionStatus[]).map((s) => (
                <option key={s} value={s}>
                  {SUBSCRIPTION_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Vencimento</label>
            <input
              type="date"
              className={inputClass}
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" variant="gold" className="flex-1" isLoading={isLoading}>
            Cadastrar barbearia
          </Button>
        </div>
      </form>
    </Modal>
  );
}
