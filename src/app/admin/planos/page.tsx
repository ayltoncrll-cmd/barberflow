'use client';

import React, { useEffect, useState } from 'react';
import { Package, Plus, Pencil, PowerOff, Power, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { adminData } from '@/lib/admin/adminData';
import { SaaSPlan } from '@/types';
import { formatCurrency } from '@/lib/utils/formatters';
import { ConfirmDialog, Toast, ToastState, AdminLoading } from '@/components/admin/AdminUI';

const emptyForm = {
  name: '',
  code: '',
  description: '',
  price: '',
  durationDays: '30',
  maxProfessionals: '1',
  features: '',
  active: true,
};

export default function AdminPlanosPage() {
  const [plans, setPlans] = useState<SaaSPlan[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SaaSPlan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [confirm, setConfirm] = useState<{ plan: SaaSPlan; nextActive: boolean } | null>(null);

  const reload = () => setPlans(adminData.listPlans());

  useEffect(() => {
    reload();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (plan: SaaSPlan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      code: plan.code,
      description: plan.description || '',
      price: String(plan.price),
      durationDays: String(plan.durationDays),
      maxProfessionals: String(plan.maxProfessionals),
      features: plan.features.join('\n'),
      active: plan.active,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const price = Number(String(form.price).replace(',', '.'));
    const duration = Number(form.durationDays);
    const maxProf = Number(form.maxProfessionals);

    if (!form.name.trim()) return setError('Informe o nome do plano.');
    if (Number.isNaN(price) || price < 0) return setError('Informe um valor válido.');
    if (Number.isNaN(duration) || duration <= 0) return setError('Informe uma duração válida em dias.');
    if (Number.isNaN(maxProf) || maxProf <= 0) return setError('Informe o limite de profissionais.');

    setSaving(true);
    setTimeout(() => {
      const payload = {
        name: form.name.trim(),
        code: (form.code.trim() || form.name.trim()).toUpperCase().replace(/\s+/g, '_'),
        description: form.description.trim(),
        price,
        durationDays: duration,
        maxProfessionals: maxProf,
        features: form.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        active: form.active,
      };

      if (editing) {
        adminData.updatePlan(editing.id, payload);
        setToast({ type: 'success', message: `Plano "${payload.name}" atualizado.` });
      } else {
        adminData.createPlan(payload);
        setToast({ type: 'success', message: `Plano "${payload.name}" criado.` });
      }

      setSaving(false);
      setModalOpen(false);
      reload();
    }, 400);
  };

  const toggleActive = (plan: SaaSPlan, nextActive: boolean) => {
    adminData.updatePlan(plan.id, { active: nextActive });
    reload();
    setConfirm(null);
    setToast({
      type: 'success',
      message: nextActive ? `Plano "${plan.name}" reativado.` : `Plano "${plan.name}" desativado.`,
    });
  };

  if (!plans) return <AdminLoading label="Carregando planos..." />;

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm';
  const labelClass = 'block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5';

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-400" /> Planos
          </h1>
          <p className="text-sm text-slate-400 mt-1">Planos oferecidos às barbearias do BarberFlow.</p>
        </div>
        <Button variant="gold" onClick={openCreate} className="shrink-0">
          <Plus className="w-4 h-4" /> Novo plano
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const inUse = adminData.countSubscriptionsByPlan(plan.id);
          return (
            <div
              key={plan.id}
              className={`glass-panel p-6 rounded-2xl border flex flex-col ${
                plan.active ? 'border-slate-800' : 'border-slate-800/50 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">{plan.name}</h2>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{plan.code}</span>
                </div>
                <Badge variant={plan.active ? 'emerald' : 'zinc'}>{plan.active ? 'Ativo' : 'Inativo'}</Badge>
              </div>

              <div className="mb-3">
                <span className="text-3xl font-extrabold text-amber-400">{formatCurrency(plan.price)}</span>
                <span className="text-sm text-slate-500"> / {plan.durationDays} dias</span>
              </div>

              {plan.description && <p className="text-sm text-slate-400 mb-3">{plan.description}</p>}

              <div className="text-xs text-slate-300 mb-3 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                {plan.maxProfessionals >= 999
                  ? 'Profissionais ilimitados'
                  : `Até ${plan.maxProfessionals} profissional${plan.maxProfessionals > 1 ? 'is' : ''}`}
              </div>

              {plan.features.length > 0 && (
                <ul className="space-y-1 mb-4 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <span className="text-purple-400 mt-0.5">•</span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <div className="text-[11px] text-slate-500 mb-3 pt-3 border-t border-slate-800">
                {inUse === 0
                  ? 'Nenhuma assinatura usando este plano'
                  : `${inUse} ${inUse === 1 ? 'assinatura usa' : 'assinaturas usam'} este plano`}
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(plan)}>
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </Button>
                <Button
                  variant={plan.active ? 'danger' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setConfirm({ plan, nextActive: !plan.active })}
                >
                  {plan.active ? (
                    <>
                      <PowerOff className="w-3.5 h-3.5" /> Desativar
                    </>
                  ) : (
                    <>
                      <Power className="w-3.5 h-3.5" /> Reativar
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Criar / editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Editar plano: ${editing.name}` : 'Novo plano'}
        maxWidth="xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nome *</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Pro"
              />
            </div>
            <div>
              <label className={labelClass}>Código</label>
              <input
                className={`${inputClass} uppercase`}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="PRO"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Descrição</label>
              <input
                className={inputClass}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Para barbearias em crescimento com equipe."
              />
            </div>
            <div>
              <label className={labelClass}>Valor (R$) *</label>
              <input
                className={inputClass}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="59,90"
              />
            </div>
            <div>
              <label className={labelClass}>Duração padrão (dias) *</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={form.durationDays}
                onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Limite de profissionais *</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={form.maxProfessionals}
                onChange={(e) => setForm({ ...form, maxProfessionals: e.target.value })}
              />
              <p className="text-[11px] text-slate-500 mt-1">Use 999 para ilimitado.</p>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 rounded accent-purple-500"
                />
                Plano ativo
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Recursos (um por linha)</label>
              <textarea
                className={`${inputClass} min-h-[100px] resize-y`}
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder={'Até 5 barbeiros\nRelatórios financeiros\nPrograma de fidelidade'}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">{error}</p>
          )}

          <div className="flex gap-3 pt-2 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="gold" className="flex-1" isLoading={saving}>
              {editing ? 'Salvar alterações' : 'Criar plano'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirm}
        title={confirm?.nextActive ? 'Reativar plano' : 'Desativar plano'}
        message={
          confirm ? (
            confirm.nextActive ? (
              <>
                Reativar o plano <strong className="text-white">{confirm.plan.name}</strong>? Ele voltará a aparecer nas
                opções de cadastro e renovação.
              </>
            ) : (
              <>
                Desativar o plano <strong className="text-white">{confirm.plan.name}</strong>? Ele deixa de ser
                oferecido em novos cadastros.
                {adminData.countSubscriptionsByPlan(confirm.plan.id) > 0 && (
                  <>
                    {' '}
                    As{' '}
                    <strong className="text-white">
                      {adminData.countSubscriptionsByPlan(confirm.plan.id)} assinaturas
                    </strong>{' '}
                    que já usam este plano continuam funcionando normalmente — o plano não é excluído.
                  </>
                )}
              </>
            )
          ) : null
        }
        confirmLabel={confirm?.nextActive ? 'Reativar plano' : 'Desativar plano'}
        variant={confirm?.nextActive ? 'default' : 'danger'}
        onConfirm={() => confirm && toggleActive(confirm.plan, confirm.nextActive)}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
