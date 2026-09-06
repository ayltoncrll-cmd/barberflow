/**
 * CAMADA DE DADOS DO PAINEL ADMIN (dono do SaaS).
 *
 * Hoje persiste em localStorage, espelhando exatamente as tabelas do Supabase
 * (barbershops, plans, subscriptions). Para migrar, basta reimplementar os
 * métodos desta classe usando o cliente Supabase — as telas não mudam.
 *
 * Mapeamento com supabase/schema.sql:
 *   Barbershop   -> public.barbershops
 *   SaaSPlan     -> public.plans
 *   Subscription -> public.subscriptions
 */
import {
  AdminBarbershopRow,
  AdminUsageStats,
  Barbershop,
  SaaSPlan,
  Subscription,
  SubscriptionStatus,
} from '@/types';
import { mockSaaSPlans } from '@/lib/store/mockData';
import { mockStore } from '@/lib/store/mockStore';
import { addDays, getDaysRemaining, hasActiveAccess } from '@/lib/utils/subscription';

const KEYS = {
  BARBERSHOPS: 'barberflow_admin_barbershops',
  PLANS: 'barberflow_admin_plans',
  SUBSCRIPTIONS: 'barberflow_admin_subscriptions',
  OWNERS: 'barberflow_admin_owners',
  USAGE: 'barberflow_admin_usage',
};

/** Owner de cada barbearia (representa profiles.full_name no banco). */
type OwnerMap = Record<string, string>;
type UsageMap = Record<string, AdminUsageStats>;

function iso(daysFromNow: number): string {
  return addDays(new Date(), daysFromNow);
}

class AdminDataStore {
  private read<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private write<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Erro ao gravar dados do admin:', e);
    }
  }

  /**
   * Prepara o armazenamento na primeira visita.
   * Cria apenas os planos padrão — a plataforma começa SEM nenhuma barbearia.
   */
  private ensureSeeded(): void {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(KEYS.BARBERSHOPS)) return;

    this.write(KEYS.BARBERSHOPS, []);
    this.write(KEYS.OWNERS, {});
    this.write(KEYS.USAGE, {});
    this.write(KEYS.SUBSCRIPTIONS, []);
    if (!localStorage.getItem(KEYS.PLANS)) {
      this.write(KEYS.PLANS, mockSaaSPlans);
    }
  }

  // ---------- PLANOS ----------
  listPlans(): SaaSPlan[] {
    this.ensureSeeded();
    return this.read<SaaSPlan[]>(KEYS.PLANS, mockSaaSPlans);
  }

  getPlan(id: string): SaaSPlan | null {
    return this.listPlans().find((p) => p.id === id) || null;
  }

  createPlan(input: Omit<SaaSPlan, 'id' | 'createdAt'>): SaaSPlan {
    const plans = this.listPlans();
    const plan: SaaSPlan = { ...input, id: `plan-${Date.now()}`, createdAt: new Date().toISOString() };
    this.write(KEYS.PLANS, [...plans, plan]);
    return plan;
  }

  updatePlan(id: string, patch: Partial<SaaSPlan>): SaaSPlan | null {
    const plans = this.listPlans();
    const idx = plans.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    plans[idx] = { ...plans[idx], ...patch };
    this.write(KEYS.PLANS, plans);
    return plans[idx];
  }

  /** Quantidade de assinaturas que usam um plano — impede desativar/remover às cegas. */
  countSubscriptionsByPlan(planId: string): number {
    return this.listSubscriptions().filter((s) => s.planId === planId).length;
  }

  // ---------- BARBEARIAS ----------
  listBarbershopsRaw(): Barbershop[] {
    this.ensureSeeded();
    return this.read<Barbershop[]>(KEYS.BARBERSHOPS, []);
  }

  private listOwners(): OwnerMap {
    this.ensureSeeded();
    return this.read<OwnerMap>(KEYS.OWNERS, {});
  }

  private listUsage(): UsageMap {
    this.ensureSeeded();
    return this.read<UsageMap>(KEYS.USAGE, {});
  }

  listSubscriptions(): Subscription[] {
    this.ensureSeeded();
    return this.read<Subscription[]>(KEYS.SUBSCRIPTIONS, []);
  }

  getUsage(barbershopId: string): AdminUsageStats {
    const usage = this.listUsage();
    return usage[barbershopId] || { professionals: 0, customers: 0, services: 0, appointments: 0 };
  }

  /** Barbearias já resolvidas com assinatura, plano e situação de acesso. */
  listRows(): AdminBarbershopRow[] {
    const shops = this.listBarbershopsRaw();
    const subs = this.listSubscriptions();
    const plans = this.listPlans();
    const owners = this.listOwners();

    return shops.map((barbershop) => {
      const subscription =
        subs.find((s) => s.barbershopId === barbershop.id) ||
        this.buildSubscription(barbershop.id, plans[0]?.id || mockSaaSPlans[0].id, 14);
      const plan = plans.find((p) => p.id === subscription.planId) || plans[0];

      return {
        barbershop,
        subscription,
        plan,
        ownerName: owners[barbershop.id] || 'Responsável',
        daysRemaining: getDaysRemaining(subscription),
        hasAccess: hasActiveAccess(subscription),
      };
    });
  }

  getRow(barbershopId: string): AdminBarbershopRow | null {
    return this.listRows().find((r) => r.barbershop.id === barbershopId) || null;
  }

  createBarbershop(input: {
    name: string;
    ownerName: string;
    phone: string;
    email: string;
    city: string;
    state: string;
    address?: string;
    planId: string;
    expiresAt: string;
    status?: SubscriptionStatus;
  }): AdminBarbershopRow {
    const shops = this.listBarbershopsRaw();
    const id = `shop-${Date.now()}`;
    const slug = input.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const barbershop: Barbershop = {
      id,
      name: input.name,
      slug: slug || id,
      ownerId: `owner-${id}`,
      phone: input.phone,
      whatsapp: input.phone,
      email: input.email,
      city: input.city,
      state: input.state.toUpperCase(),
      address: input.address || '',
      description: '',
      active: true,
      createdAt: new Date().toISOString(),
    };
    this.write(KEYS.BARBERSHOPS, [barbershop, ...shops]);

    const owners = this.listOwners();
    owners[id] = input.ownerName;
    this.write(KEYS.OWNERS, owners);

    const usage = this.listUsage();
    usage[id] = { professionals: 0, customers: 0, services: 0, appointments: 0 };
    this.write(KEYS.USAGE, usage);

    const now = new Date().toISOString();
    const subscription: Subscription = {
      id: `sub-${id}`,
      barbershopId: id,
      planId: input.planId,
      status: input.status || 'ACTIVE',
      startsAt: now,
      trialEndsAt: input.expiresAt,
      currentPeriodEnd: input.expiresAt,
      createdAt: now,
      updatedAt: now,
    };
    this.write(KEYS.SUBSCRIPTIONS, [...this.listSubscriptions(), subscription]);

    return this.getRow(id)!;
  }

  /**
   * Exclui a barbearia e TUDO que depende dela (assinatura, responsável e
   * estatísticas de uso). Diferente de suspender/cancelar, isto é irreversível.
   *
   * No Supabase o equivalente é DELETE em public.barbershops: as tabelas filhas
   * têm ON DELETE CASCADE, então profissionais, serviços, clientes e
   * agendamentos saem junto.
   */
  deleteBarbershop(barbershopId: string): { success: boolean; message?: string } {
    const shops = this.listBarbershopsRaw();
    const shop = shops.find((b) => b.id === barbershopId);
    if (!shop) {
      return { success: false, message: 'Barbearia não encontrada.' };
    }

    this.write(
      KEYS.BARBERSHOPS,
      shops.filter((b) => b.id !== barbershopId)
    );
    this.write(
      KEYS.SUBSCRIPTIONS,
      this.listSubscriptions().filter((sub) => sub.barbershopId !== barbershopId)
    );

    const owners = this.listOwners();
    delete owners[barbershopId];
    this.write(KEYS.OWNERS, owners);

    const usage = this.listUsage();
    delete usage[barbershopId];
    this.write(KEYS.USAGE, usage);

    return { success: true };
  }

  /** Monta uma assinatura nova em período de teste. */
  private buildSubscription(barbershopId: string, planId: string, trialDays: number): Subscription {
    const now = new Date().toISOString();
    const endsAt = iso(trialDays);
    return {
      id: `sub-${barbershopId}`,
      barbershopId,
      planId,
      status: 'TRIAL',
      startsAt: now,
      trialEndsAt: endsAt,
      currentPeriodEnd: endsAt,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Registra no painel administrativo uma barbearia criada pelo cadastro
   * público (/onboarding), já com período de teste. Se a barbearia já estiver
   * registrada, apenas atualiza os dados cadastrais.
   */
  registerFromOnboarding(barbershop: Barbershop, ownerName: string, trialDays = 14): AdminBarbershopRow {
    const shops = this.listBarbershopsRaw();
    const existing = shops.findIndex((b) => b.id === barbershop.id);

    if (existing === -1) {
      this.write(KEYS.BARBERSHOPS, [barbershop, ...shops]);
    } else {
      shops[existing] = { ...shops[existing], ...barbershop };
      this.write(KEYS.BARBERSHOPS, shops);
    }

    const owners = this.listOwners();
    owners[barbershop.id] = ownerName;
    this.write(KEYS.OWNERS, owners);

    const usage = this.listUsage();
    if (!usage[barbershop.id]) {
      usage[barbershop.id] = { professionals: 0, customers: 0, services: 0, appointments: 0 };
      this.write(KEYS.USAGE, usage);
    }

    const subs = this.listSubscriptions();
    if (!subs.some((sub) => sub.barbershopId === barbershop.id)) {
      const plans = this.listPlans().filter((pl) => pl.active);
      const planId = plans[0]?.id || mockSaaSPlans[0].id;
      this.write(KEYS.SUBSCRIPTIONS, [...subs, this.buildSubscription(barbershop.id, planId, trialDays)]);
    }

    return this.getRow(barbershop.id)!;
  }

  /** Mantém os contadores de uso da barbearia em dia com o que existe no painel dela. */
  syncUsage(barbershopId: string, stats: AdminUsageStats): void {
    const usage = this.listUsage();
    usage[barbershopId] = stats;
    this.write(KEYS.USAGE, usage);
  }

  // ---------- ASSINATURAS (controle manual) ----------
  updateSubscription(barbershopId: string, patch: Partial<Subscription>): Subscription | null {
    const subs = this.listSubscriptions();
    const idx = subs.findIndex((s) => s.barbershopId === barbershopId);
    if (idx === -1) return null;
    subs[idx] = { ...subs[idx], ...patch, updatedAt: new Date().toISOString() };
    this.write(KEYS.SUBSCRIPTIONS, subs);
    return subs[idx];
  }

  setStatus(barbershopId: string, status: SubscriptionStatus): Subscription | null {
    return this.updateSubscription(barbershopId, { status });
  }

  /** Renova a partir de hoje (ou do vencimento, se ainda no futuro) e reativa a conta. */
  renew(barbershopId: string, days: number): Subscription | null {
    const sub = this.listSubscriptions().find((s) => s.barbershopId === barbershopId);
    if (!sub) return null;
    const currentEnd = new Date(sub.currentPeriodEnd);
    const base = currentEnd > new Date() ? currentEnd : new Date();
    return this.updateSubscription(barbershopId, {
      status: 'ACTIVE',
      startsAt: new Date().toISOString(),
      currentPeriodEnd: addDays(base, days),
    });
  }

  /** Concede dias extras sem alterar o status (usado para cortesias). */
  grantDays(barbershopId: string, days: number): Subscription | null {
    const sub = this.listSubscriptions().find((s) => s.barbershopId === barbershopId);
    if (!sub) return null;
    const currentEnd = new Date(sub.currentPeriodEnd);
    const base = currentEnd > new Date() ? currentEnd : new Date();
    const newEnd = addDays(base, days);
    return this.updateSubscription(barbershopId, {
      currentPeriodEnd: newEnd,
      trialEndsAt: sub.status === 'TRIAL' ? newEnd : sub.trialEndsAt,
      status: sub.status === 'EXPIRED' ? 'ACTIVE' : sub.status,
    });
  }

  /** Libera um período gratuito, colocando a conta em teste. */
  grantTrial(barbershopId: string, days: number): Subscription | null {
    const endsAt = iso(days);
    return this.updateSubscription(barbershopId, {
      status: 'TRIAL',
      startsAt: new Date().toISOString(),
      trialEndsAt: endsAt,
      currentPeriodEnd: endsAt,
    });
  }

  // ---------- MÉTRICAS DO DASHBOARD ----------
  getDashboardMetrics() {
    const rows = this.listRows();
    const byStatus = (status: SubscriptionStatus) =>
      rows.filter((r) => r.subscription.status === status).length;

    const recent = [...rows].sort(
      (a, b) => new Date(b.barbershop.createdAt).getTime() - new Date(a.barbershop.createdAt).getTime()
    );

    const last30Days = rows.filter(
      (r) => (Date.now() - new Date(r.barbershop.createdAt).getTime()) / (1000 * 60 * 60 * 24) <= 30
    );

    const expiringSoon = rows
      .filter((r) => r.hasAccess && r.daysRemaining >= 0 && r.daysRemaining <= 7)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    const recentlyExpired = rows
      .filter((r) => !r.hasAccess && r.daysRemaining < 0 && r.daysRemaining >= -30)
      .sort((a, b) => b.daysRemaining - a.daysRemaining);

    return {
      total: rows.length,
      active: byStatus('ACTIVE'),
      trial: byStatus('TRIAL'),
      expired: byStatus('EXPIRED'),
      suspended: byStatus('SUSPENDED'),
      cancelled: byStatus('CANCELLED'),
      blocked: rows.filter((r) => !r.hasAccess).length,
      newLast30Days: last30Days.length,
      mrr: rows
        .filter((r) => r.subscription.status === 'ACTIVE')
        .reduce((sum, r) => sum + (r.plan?.price || 0), 0),
      expiringToday: rows.filter((r) => r.hasAccess && r.daysRemaining === 0).length,
      expiringIn3Days: rows.filter((r) => r.hasAccess && r.daysRemaining > 0 && r.daysRemaining <= 3).length,
      expiringIn7Days: expiringSoon.length,
      expiringSoon,
      recentlyExpired,
      recentShops: recent.slice(0, 6),
    };
  }

  /**
   * Situação da barbearia que está usando o painel /dashboard.
   * É o que a tela de bloqueio consulta.
   */
  getCurrentBarbershopRow(): AdminBarbershopRow | null {
    return this.getRow(mockStore.getBarbershop().id);
  }

  /**
   * Apaga TODAS as barbearias, assinaturas e planos do painel administrativo,
   * voltando a plataforma ao estado inicial (planos padrão, zero barbearias).
   */
  resetAll(): void {
    if (typeof window === 'undefined') return;
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    this.ensureSeeded();
  }
}

export const adminData = new AdminDataStore();
