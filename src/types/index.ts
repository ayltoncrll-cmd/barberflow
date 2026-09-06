export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'GERENTE' | 'BARBER' | 'CUSTOMER';

export type AppointmentStatus = 
  | 'SCHEDULED' 
  | 'CONFIRMED' 
  | 'IN_SERVICE' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW';

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';

export interface Profile {
  id: string;
  userId?: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

export interface Barbershop {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  city: string;
  state: string;
  address: string;
  logoUrl?: string;
  description?: string;
  active: boolean;
  createdAt: string;
}

export interface Professional {
  id: string;
  barbershopId: string;
  userId?: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  email?: string;
  bio?: string;
  commissionRate: number; // percentage e.g. 50%
  active: boolean;
  createdAt: string;
  serviceIds?: string[];
}

export interface Service {
  id: string;
  barbershopId: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  active: boolean;
  createdAt: string;
}

export interface BusinessHour {
  id: string;
  barbershopId: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  openTime: string; // "08:00"
  closeTime: string; // "20:00"
  isClosed: boolean;
}

export interface ProfessionalSchedule {
  id: string;
  professionalId: string;
  dayOfWeek: number;
  startTime: string; // "08:00"
  endTime: string; // "19:00"
  breakStart?: string; // "12:00"
  breakEnd?: string; // "13:00"
  isWorking: boolean;
}

export interface HolidayClosure {
  id: string;
  barbershopId: string;
  date: string; // YYYY-MM-DD
  title: string; // e.g. "Independência do Brasil"
  isClosed: boolean;
  openTime?: string; // "09:00"
  closeTime?: string; // "14:00"
}

export interface ScheduleBlock {
  id: string;
  barbershopId: string;
  professionalId?: string;
  title: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  reason?: string;
}

export interface Customer {
  id: string;
  barbershopId: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  birthDate?: string;
  notes?: string;
  firstVisitAt: string;
  lastVisitAt: string;
  totalVisits: number;
  totalSpent: number;
  createdAt: string;
  stampsCount?: number;
}

export interface Appointment {
  id: string;
  barbershopId: string;
  customerId: string;
  professionalId: string;
  serviceId: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  totalPrice: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
  professionalName?: string;
  serviceName?: string;
  serviceDuration?: number;
}

export interface LoyaltyProgram {
  id: string;
  barbershopId: string;
  isActive: boolean;
  requiredStamps: number;
  rewardDescription: string;
}

export interface SaaSPlan {
  id: string;
  name: string;
  code: string;
  description?: string;
  price: number;
  /** Duração padrão em dias usada nas renovações. */
  durationDays: number;
  /** Use 999 ou mais para representar profissionais ilimitados. */
  maxProfessionals: number;
  features: string[];
  active: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  barbershopId: string;
  planId: string;
  status: SubscriptionStatus;
  /** Início do período vigente. */
  startsAt: string;
  trialEndsAt: string;
  /** Vencimento do período vigente (expires_at no banco). */
  currentPeriodEnd: string;
  /** Observações administrativas do dono do SaaS. */
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Barbearia + assinatura + plano, já resolvidos para as telas do admin. */
export interface AdminBarbershopRow {
  barbershop: Barbershop;
  subscription: Subscription;
  plan: SaaSPlan;
  ownerName: string;
  daysRemaining: number;
  hasAccess: boolean;
}

export interface AdminUsageStats {
  professionals: number;
  customers: number;
  services: number;
  appointments: number;
}
