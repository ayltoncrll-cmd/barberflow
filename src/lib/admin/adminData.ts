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
import { mockSaaSPlans, mockBarbershop } from '@/lib/store/mockData';
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

function makeSubscription(
  barbershopId: string,
  planId: string,
  status: SubscriptionStatus,
  startDaysAgo: number,
  endInDays: number
): Subscription {
  const startsAt = iso(-startDaysAgo);
  return {
    id: `sub-${barbershopId}`,
    barbershopId,
    planId,
    status,
    startsAt,
    trialEndsAt: status === 'TRIAL' ? iso(endInDays) : addDays(startsAt, 14),
    currentPeriodEnd: iso(endInDays),
    createdAt: startsAt,
    updatedAt: new Date().toISOString(),
  };
}

/** Barbearias de exemplo para o painel ter volume realista. */
function seedBarbershops(): { shops: Barbershop[]; owners: OwnerMap; usage: UsageMap } {
  const base: Array<{
    id: string;
    name: string;
    slug: string;
    owner: string;
    phone: string;
    email: string;
    city: string;
    state: string;
    address: string;
    createdDaysAgo: number;
    usage: AdminUsageStats;
  }> = [
    {
      id: 'shop-imperial',
      name: 'Barbearia Imperial',
      slug: 'barbearia-imperial',
      owner: 'Roberto Imperial',
      phone: '(11) 98888-1111',
      email: 'contato@barbeariaimperial.com',
      city: 'São Paulo',
      state: 'SP',
      address: 'Av. Paulista, 1000 - Bela Vista',
      createdDaysAgo: 190,
      usage: { professionals: 5, customers: 412, services: 8, appointments: 1284 },
    },
    {
      id: 'shop-navalha',
      name: 'Navalha de Ouro',
      slug: 'navalha-de-ouro',
      owner: 'Marcos Aurélio',
      phone: '(21) 97777-2222',
      email: 'contato@navalhadeouro.com',
      city: 'Rio de Janeiro',
      state: 'RJ',
      address: 'Rua Barata Ribeiro, 320 - Copacabana',
      createdDaysAgo: 120,
      usage: { professionals: 3, customers: 268, services: 6, appointments: 742 },
    },
    {
      id: 'shop-dompedro',
      name: 'Barbearia Dom Pedro',
      slug: 'barbearia-dom-pedro',
      owner: 'Pedro Henrique Alves',
      phone: '(31) 96666-3333',
      email: 'dompedro@barbearia.com',
      city: 'Belo Horizonte',
      state: 'MG',
      address: 'Av. Afonso Pena, 45 - Centro',
      createdDaysAgo: 62,
      usage: { professionals: 2, customers: 134, services: 5, appointments: 388 },
    },
    {
      id: 'shop-vintage',
      name: 'Vintage Barber Club',
      slug: 'vintage-barber-club',
      owner: 'Ricardo Santos',
      phone: '(41) 95555-4444',
      email: 'contato@vintagebarber.com',
      city: 'Curitiba',
      state: 'PR',
      address: 'Rua XV de Novembro, 780 - Centro',
      createdDaysAgo: 24,
      usage: { professionals: 4, customers: 96, services: 7, appointments: 214 },
    },
    {
      id: 'shop-corte-nobre',
      name: 'Corte Nobre',
      slug: 'corte-nobre',
      owner: 'Anderson Lima',
      phone: '(51) 94444-5555',
      email: 'contato@cortenobre.com',
      city: 'Porto Alegre',
      state: 'RS',
      address: 'Av. Ipiranga, 2200 - Praia de Belas',
      createdDaysAgo: 12,
      usage: { professionals: 1, customers: 38, services: 4, appointments: 71 },
    },
    {
      id: 'shop-barba-negra',
      name: 'Barba Negra',
      slug: 'barba-negra',
      owner: 'Thiago Moreira',
      phone: '(71) 93333-6666',
      email: 'contato@barbanegra.com',
      city: 'Salvador',
      state: 'BA',
      address: 'Rua Chile, 15 - Comércio',
      createdDaysAgo: 310,
      usage: { professionals: 6, customers: 520, services: 9, appointments: 1630 },
    },
    {
      id: 'shop-old-school',
      name: 'Old School Barbearia',
      slug: 'old-school-barbearia',
      owner: 'Fernando Dias',
      phone: '(85) 92222-7777',
      email: 'contato@oldschoolbarber.com',
      city: 'Fortaleza',
      state: 'CE',
      address: 'Av. Beira Mar, 900 - Meireles',
      createdDaysAgo: 240,
      usage: { professionals: 3, customers: 289, services: 6, appointments: 905 },
    },
    {
      id: 'shop-elite',
      name: 'Elite Barber Studio',
      slug: 'elite-barber-studio',
      owner: 'Gustavo Prado',
      phone: '(62) 91111-8888',
      email: 'contato@elitebarber.com',
      city: 'Goiânia',
      state: 'GO',
      address: 'Av. T-63, 1200 - Setor Bueno',
      createdDaysAgo: 5,
      usage: { professionals: 2, customers: 12, services: 3, appointments: 19 },
    },
  ];

  const shops: Barbershop[] = base.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    ownerId: `owner-${b.id}`,
    phone: b.phone,
    whatsapp: b.phone,
    email: b.email,
    city: b.city,
    state: b.state,
    address: b.address,
    description: '',
    active: true,
    createdAt: iso(-b.createdDaysAgo),
  }));

  const owners: OwnerMap = {};
  const usage: UsageMap = {};
  base.forEach((b) => {
    owners[b.id] = b.owner;
    usage[b.id] = b.usage;
  });

  // A barbearia real do mockStore (a que o dono usa no /dashboard) entra na lista.
  const local = mockStore.getBarbershop();
  shops.unshift(local);
  owners[local.id] = mockStore.getAccount()?.ownerName || 'Responsável';
  usage[local.id] = {
    professionals: mockStore.getProfessionals().length,
    customers: mockStore.getCustomers().length,
    services: mockStore.getServices().length,
    appointments: mockStore.getAppointments().length,
  };

  return { shops, owners, usage };
}

function seedSubscriptions(shops: Barbershop[]): Subscription[] {
  const [starter, pro, premium] = mockSaaSPlans;
  const plan = (id: string) => id;

  const config: Record<string, { planId: string; status: SubscriptionStatus; start: number; end: number }> = {
    'shop-imperial': { planId: plan(pro.id), status: 'ACTIVE', start: 25, end: 5 },
    'shop-navalha': { planId: plan(premium.id), status: 'ACTIVE', start: 28, end: 2 },
    'shop-dompedro': { planId: plan(starter.id), status: 'EXPIRED', start: 40, end: -10 },
    'shop-vintage': { planId: plan(pro.id), status: 'TRIAL', start: 10, end: 4 },
    'shop-corte-nobre': { planId: plan(starter.id), status: 'TRIAL', start: 12, end: 0 },
    'shop-barba-negra': { planId: plan(premium.id), status: 'SUSPENDED', start: 60, end: -3 },
    'shop-old-school': { planId: plan(pro.id), status: 'CANCELLED', start: 90, end: -25 },
    'shop-elite': { planId: plan(starter.id), status: 'ACTIVE', start: 5, end: 25 },
  };

  return shops.map((shop) => {
    const c = config[shop.id];
    if (c) return makeSubscription(shop.id, c.planId, c.status, c.start, c.end);
    // Barbearia local: assinatura Pro ativa com 20 dias restantes.
    return makeSubscription(shop.id, pro.id, 'ACTIVE', 10, 20);
  });
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

  /** Cria os dados iniciais na primeira visita ao painel. */
  private ensureSeeded(): void {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(KEYS.BARBERSHOPS)) return;

    const { shops, owners, usage } = seedBarbershops();
    this.write(KEYS.BARBERSHOPS, shops);
    this.write(KEYS.OWNERS, owners);
    this.write(KEYS.USAGE, usage);
    this.write(KEYS.PLANS, mockSaaSPlans);
    this.write(KEYS.SUBSCRIPTIONS, seedSubscriptions(shops));
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
        makeSubscription(barbershop.id, plans[0]?.id || 'p1', 'TRIAL', 0, 14);
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
    const localId = mockStore.getBarbershop().id;
    return this.getRow(localId) || this.getRow(mockBarbershop.id);
  }

  /** Reseta os dados de demonstração do painel admin. */
  resetSeed(): void {
    if (typeof window === 'undefined') return;
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    this.ensureSeeded();
  }
}

export const adminData = new AdminDataStore();
