'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  CreditCard,
  RefreshCw,
  PlusCircle,
  PauseCircle,
  PlayCircle,
  XCircle,
  Gift,
  Save,
  Users,
  Scissors,
  UserCheck,
  CalendarCheck,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { adminData } from '@/lib/admin/adminData';
import { AdminBarbershopRow, AdminUsageStats, SaaSPlan, SubscriptionStatus } from '@/types';
import { formatCurrency, formatDateBR } from '@/lib/utils/formatters';
import {
  SUBSCRIPTION_STATUS_LABEL,
  SUBSCRIPTION_STATUSES,
  addDays,
  dateInputToISO,
  isoToDateInput,
} from '@/lib/utils/subscription';
import {
  StatusBadge,
  ExpiryBadge,
  ConfirmDialog,
  Toast,
  ToastState,
  AdminLoading,
} from '@/components/admin/AdminUI';

const RENEW_OPTIONS = [30, 90, 180, 365];
const GRANT_OPTIONS = [7, 15, 30];

export default function AdminBarbeariaDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || '');

  const [row, setRow] = useState<AdminBarbershopRow | null>(null);
  const [usage, setUsage] = useState<AdminUsageStats | null>(null);
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [renewOpen, setRenewOpen] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: React.ReactNode;
    confirmLabel: string;
    variant?: 'danger' | 'default';
    action: () => void;
  } | null>(null);

  // Formulário de edição manual da assinatura
  const [editPlanId, setEditPlanId] = useState('');
  const [editStatus, setEditStatus] = useState<SubscriptionStatus>('ACTIVE');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = React.useCallback(() => {
    const found = adminData.getRow(id);
    if (!found) {
      setNotFound(true);
      return;
    }
    setRow(found);
    setUsage(adminData.getUsage(id));
    setPlans(adminData.listPlans());
    setEditPlanId(found.subscription.planId);
    setEditStatus(found.subscription.status);
    setEditStart(isoToDateInput(found.subscription.startsAt));
    setEditEnd(isoToDateInput(found.subscription.currentPeriodEnd));
    setEditNotes(found.subscription.adminNotes || '');
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (notFound) {
    return (
      <div className="text-center py-20 space-y-4">
        <h1 className="text-xl font-bold text-white">Barbearia não encontrada</h1>
        <p className="text-sm text-slate-400">O registro pode ter sido removido.</p>
        <Button variant="secondary" onClick={() => router.push('/admin/barbearias')}>
          <ArrowLeft className="w-4 h-4" /> Voltar para a lista
        </Button>
      </div>
    );
  }

  if (!row || !usage) return <AdminLoading label="Carregando dados da barbearia..." />;

  const { barbershop, subscription, plan, ownerName, daysRemaining, hasAccess } = row;

  const runAction = (fn: () => void, message: string) => {
    fn();
    load();
    setConfirm(null);
    setToast({ type: 'success', message });
  };

  const handleSaveSubscription = () => {
    setSaving(true);
    setTimeout(() => {
      adminData.updateSubscription(id, {
        planId: editPlanId,
        status: editStatus,
        startsAt: dateInputToISO(editStart),
        currentPeriodEnd: dateInputToISO(editEnd),
        trialEndsAt: editStatus === 'TRIAL' ? dateInputToISO(editEnd) : subscription.trialEndsAt,
        adminNotes: editNotes,
      });
      setSaving(false);
      load();
      setToast({ type: 'success', message: 'Assinatura atualizada com sucesso.' });
    }, 400);
  };

  const infoRow = (Icon: React.ElementType, label: string, value: React.ReactNode) => (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">{label}</div>
        <div className="text-sm text-slate-200 break-words">{value || '—'}</div>
      </div>
    </div>
  );

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm';
  const labelClass = 'block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5';

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <Link
        href="/admin/barbearias"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-purple-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para barbearias
      </Link>

      {/* Cabeçalho */}
      <header className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-lg border border-purple-500/30 shrink-0">
            {barbershop.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{barbershop.name}</h1>
            <p className="text-sm text-slate-400 truncate">
              {ownerName} · {barbershop.city}/{barbershop.state}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <StatusBadge status={subscription.status} />
          <ExpiryBadge daysRemaining={daysRemaining} hasAccess={hasAccess} />
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              hasAccess
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}
          >
            {hasAccess ? 'Acesso liberado' : 'Acesso bloqueado'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados da barbearia */}
        <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 lg:col-span-1">
          <h2 className="font-bold text-white flex items-center gap-2 mb-3 pb-3 border-b border-slate-800">
            <Building2 className="w-4 h-4 text-purple-400" /> Dados da barbearia
          </h2>
          <div className="divide-y divide-slate-800/60">
            {infoRow(Building2, 'Nome', barbershop.name)}
            {infoRow(User, 'Responsável', ownerName)}
            {infoRow(Phone, 'WhatsApp', barbershop.whatsapp || barbershop.phone)}
            {infoRow(Mail, 'E-mail', barbershop.email)}
            {infoRow(MapPin, 'Endereço', `${barbershop.address || '—'}, ${barbershop.city}/${barbershop.state}`)}
            {infoRow(CalendarDays, 'Data de cadastro', formatDateBR(barbershop.createdAt))}
            {infoRow(
              ExternalLink,
              'Página pública',
              <a
                href={`/barbearia/${barbershop.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline"
              >
                /barbearia/{barbershop.slug}
              </a>
            )}
          </div>
        </section>

        {/* Assinatura + ações */}
        <section className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800">
            <h2 className="font-bold text-white flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <CreditCard className="w-4 h-4 text-purple-400" /> Assinatura
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Plano atual</div>
                <div className="text-base font-bold text-amber-400 mt-1">{plan?.name}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Valor</div>
                <div className="text-base font-bold text-white mt-1">{formatCurrency(plan?.price || 0)}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Início</div>
                <div className="text-sm font-mono text-slate-200 mt-1.5">{formatDateBR(subscription.startsAt)}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Vencimento</div>
                <div className="text-sm font-mono text-slate-200 mt-1.5">
                  {formatDateBR(subscription.currentPeriodEnd)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Dias restantes</div>
                <div
                  className={`text-base font-bold mt-1 ${
                    daysRemaining < 0 ? 'text-red-400' : daysRemaining <= 3 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {daysRemaining < 0 ? `${Math.abs(daysRemaining)} em atraso` : daysRemaining}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Fim do teste</div>
                <div className="text-sm font-mono text-slate-200 mt-1.5">{formatDateBR(subscription.trialEndsAt)}</div>
              </div>
              <div className="col-span-2">
                <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Situação</div>
                <div className="mt-1.5">
                  <StatusBadge status={subscription.status} />
                </div>
              </div>
            </div>

            {/* Ações rápidas */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
              <Button variant="gold" size="sm" onClick={() => setRenewOpen(true)}>
                <RefreshCw className="w-4 h-4" /> Renovar assinatura
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setGrantOpen(true)}>
                <PlusCircle className="w-4 h-4" /> Adicionar dias
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setConfirm({
                    title: 'Liberar período gratuito',
                    message: (
                      <>
                        Colocar <strong className="text-white">{barbershop.name}</strong> em período de teste por 14
                        dias? A assinatura passa para <strong className="text-white">Período de teste</strong>.
                      </>
                    ),
                    confirmLabel: 'Liberar 14 dias grátis',
                    action: () =>
                      runAction(() => adminData.grantTrial(id, 14), 'Período gratuito de 14 dias liberado.'),
                  })
                }
              >
                <Gift className="w-4 h-4" /> Liberar teste
              </Button>

              {subscription.status === 'SUSPENDED' || subscription.status === 'CANCELLED' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setConfirm({
                      title: 'Reativar conta',
                      message: (
                        <>
                          Reativar o acesso de <strong className="text-white">{barbershop.name}</strong>? A assinatura
                          volta para <strong className="text-white">Ativa</strong> e o painel é liberado imediatamente.
                        </>
                      ),
                      confirmLabel: 'Reativar conta',
                      action: () => runAction(() => adminData.setStatus(id, 'ACTIVE'), 'Conta reativada com sucesso.'),
                    })
                  }
                >
                  <PlayCircle className="w-4 h-4" /> Reativar conta
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setConfirm({
                      title: 'Suspender conta',
                      message: (
                        <>
                          Suspender <strong className="text-white">{barbershop.name}</strong>? O acesso ao painel será
                          bloqueado imediatamente, mas{' '}
                          <strong className="text-white">nenhum dado será excluído</strong>.
                        </>
                      ),
                      confirmLabel: 'Suspender conta',
                      variant: 'danger',
                      action: () => runAction(() => adminData.setStatus(id, 'SUSPENDED'), 'Conta suspensa.'),
                    })
                  }
                >
                  <PauseCircle className="w-4 h-4" /> Suspender
                </Button>
              )}

              {subscription.status !== 'CANCELLED' && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    setConfirm({
                      title: 'Cancelar assinatura',
                      message: (
                        <>
                          Cancelar a assinatura de <strong className="text-white">{barbershop.name}</strong>? O acesso
                          será bloqueado. Os dados permanecem salvos e o acesso volta se a assinatura for reativada.
                        </>
                      ),
                      confirmLabel: 'Cancelar assinatura',
                      variant: 'danger',
                      action: () => runAction(() => adminData.setStatus(id, 'CANCELLED'), 'Assinatura cancelada.'),
                    })
                  }
                >
                  <XCircle className="w-4 h-4" /> Cancelar
                </Button>
              )}
            </div>
          </div>

          {/* Edição manual */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800">
            <h2 className="font-bold text-white flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <Save className="w-4 h-4 text-purple-400" /> Alteração manual
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Plano</label>
                <select className={inputClass} value={editPlanId} onChange={(e) => setEditPlanId(e.target.value)}>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.price)}
                      {p.active ? '' : ' (inativo)'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  className={inputClass}
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as SubscriptionStatus)}
                >
                  {SUBSCRIPTION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {SUBSCRIPTION_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Data de início</label>
                <input
                  type="date"
                  className={inputClass}
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Data de vencimento</label>
                <input
                  type="date"
                  className={inputClass}
                  value={editEnd}
                  onChange={(e) => setEditEnd(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Observações administrativas</label>
                <textarea
                  className={`${inputClass} min-h-[80px] resize-y`}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Anotações internas sobre esta conta (visível apenas para a administração)."
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-4 border-t border-slate-800">
              <Button variant="gold" onClick={handleSaveSubscription} isLoading={saving}>
                <Save className="w-4 h-4" /> Salvar alterações
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Utilização */}
      <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800">
        <h2 className="font-bold text-white mb-4 pb-3 border-b border-slate-800">Utilização da conta</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Profissionais', value: usage.professionals, icon: UserCheck, color: 'text-purple-400' },
            { label: 'Clientes', value: usage.customers, icon: Users, color: 'text-blue-400' },
            { label: 'Serviços', value: usage.services, icon: Scissors, color: 'text-amber-400' },
            { label: 'Agendamentos', value: usage.appointments, icon: CalendarCheck, color: 'text-emerald-400' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <Icon className={`w-4 h-4 ${item.color} mb-2`} />
                <div className="text-2xl font-extrabold text-white">{item.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Limite do plano {plan?.name}:{' '}
          {(plan?.maxProfessionals || 0) >= 999 ? 'profissionais ilimitados' : `${plan?.maxProfessionals} profissionais`}.
        </p>
      </section>

      <RenewModal
        isOpen={renewOpen}
        onClose={() => setRenewOpen(false)}
        planName={plan?.name || ''}
        currentEnd={subscription.currentPeriodEnd}
        onConfirm={(days, customDate) => {
          if (customDate) {
            adminData.updateSubscription(id, {
              status: 'ACTIVE',
              startsAt: new Date().toISOString(),
              currentPeriodEnd: dateInputToISO(customDate),
            });
          } else {
            adminData.renew(id, days);
          }
          setRenewOpen(false);
          load();
          setToast({ type: 'success', message: 'Assinatura renovada com sucesso.' });
        }}
      />

      <GrantDaysModal
        isOpen={grantOpen}
        onClose={() => setGrantOpen(false)}
        currentEnd={subscription.currentPeriodEnd}
        onConfirm={(days) => {
          adminData.grantDays(id, days);
          setGrantOpen(false);
          load();
          setToast({ type: 'success', message: `${days} dias adicionados à assinatura.` });
        }}
      />

      <ConfirmDialog
        isOpen={!!confirm}
        title={confirm?.title || ''}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        variant={confirm?.variant}
        onConfirm={() => confirm?.action()}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}

function RenewModal({
  isOpen,
  onClose,
  planName,
  currentEnd,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  currentEnd: string;
  onConfirm: (days: number, customDate?: string) => void;
}) {
  const [days, setDays] = useState(30);
  const [useCustom, setUseCustom] = useState(false);
  const [customDate, setCustomDate] = useState(isoToDateInput(addDays(new Date(), 30)));

  const base = new Date(currentEnd) > new Date() ? new Date(currentEnd) : new Date();
  const preview = useCustom ? dateInputToISO(customDate) : addDays(base, days);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Renovar assinatura" maxWidth="md">
      <div className="space-y-5">
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Plano</span>
            <span className="font-bold text-amber-400">{planName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Vencimento atual</span>
            <span className="font-mono text-slate-200">{formatDateBR(currentEnd)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-800">
            <span className="text-slate-400">Novo vencimento</span>
            <span className="font-mono font-bold text-emerald-400">{formatDateBR(preview)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Período</label>
          <div className="grid grid-cols-4 gap-2">
            {RENEW_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDays(d);
                  setUseCustom(false);
                }}
                className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  !useCustom && days === d
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {d} dias
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={useCustom}
              onChange={(e) => setUseCustom(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500"
            />
            Usar data personalizada
          </label>
          {useCustom && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
            />
          )}
        </div>

        <div className="flex gap-3 pt-2 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button variant="gold" onClick={() => onConfirm(days, useCustom ? customDate : undefined)} className="flex-1">
            Confirmar renovação
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function GrantDaysModal({
  isOpen,
  onClose,
  currentEnd,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentEnd: string;
  onConfirm: (days: number) => void;
}) {
  const [days, setDays] = useState(7);
  const [custom, setCustom] = useState('');

  const finalDays = custom ? Number(custom) || 0 : days;
  const base = new Date(currentEnd) > new Date() ? new Date(currentEnd) : new Date();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar dias de acesso" maxWidth="md">
      <div className="space-y-5">
        <p className="text-sm text-slate-400">
          Concede dias extras sem alterar o plano. Útil para cortesias e negociações.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {GRANT_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => {
                setDays(d);
                setCustom('');
              }}
              className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                !custom && days === d
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              +{d} dias
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Quantidade personalizada
          </label>
          <input
            type="number"
            min={1}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Ex: 45"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 flex justify-between text-sm">
          <span className="text-slate-400">Novo vencimento</span>
          <span className="font-mono font-bold text-emerald-400">
            {finalDays > 0 ? formatDateBR(addDays(base, finalDays)) : '—'}
          </span>
        </div>

        <div className="flex gap-3 pt-2 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button variant="gold" onClick={() => onConfirm(finalDays)} className="flex-1" disabled={finalDays <= 0}>
            Adicionar {finalDays > 0 ? `${finalDays} dias` : 'dias'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
