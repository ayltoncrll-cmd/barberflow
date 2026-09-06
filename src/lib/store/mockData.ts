import { Barbershop, Professional, Service, Customer, Appointment, ScheduleBlock, BusinessHour, ProfessionalSchedule, SaaSPlan, LoyaltyProgram } from '@/types';

/**
 * Barbearia ainda não configurada. Os campos são preenchidos pelo cadastro
 * (/onboarding) ou em Configurações — nenhum dado fictício aqui.
 */
export const mockBarbershop: Barbershop = {
  id: 'barbershop-local',
  name: 'Minha Barbearia',
  slug: 'minha-barbearia',
  ownerId: 'owner-local',
  phone: '',
  whatsapp: '',
  email: '',
  city: '',
  state: '',
  address: '',
  description: '',
  active: true,
  createdAt: new Date().toISOString(),
};

export const mockProfessionals: Professional[] = [];

export const mockServices: Service[] = [];

export const mockCustomers: Customer[] = [];

export const mockAppointments: Appointment[] = [];

export const mockBusinessHours: BusinessHour[] = [
  { id: 'bh-0', barbershopId: mockBarbershop.id, dayOfWeek: 0, openTime: '09:00', closeTime: '15:00', isClosed: true },
  { id: 'bh-1', barbershopId: mockBarbershop.id, dayOfWeek: 1, openTime: '08:00', closeTime: '20:00', isClosed: false },
  { id: 'bh-2', barbershopId: mockBarbershop.id, dayOfWeek: 2, openTime: '08:00', closeTime: '20:00', isClosed: false },
  { id: 'bh-3', barbershopId: mockBarbershop.id, dayOfWeek: 3, openTime: '08:00', closeTime: '20:00', isClosed: false },
  { id: 'bh-4', barbershopId: mockBarbershop.id, dayOfWeek: 4, openTime: '08:00', closeTime: '20:00', isClosed: false },
  { id: 'bh-5', barbershopId: mockBarbershop.id, dayOfWeek: 5, openTime: '08:00', closeTime: '20:00', isClosed: false },
  { id: 'bh-6', barbershopId: mockBarbershop.id, dayOfWeek: 6, openTime: '08:00', closeTime: '19:00', isClosed: false },
];

export const mockProfessionalSchedules: ProfessionalSchedule[] = [];

export const mockScheduleBlocks: ScheduleBlock[] = [];

export const mockLoyaltyProgram: LoyaltyProgram = {
  id: 'loyalty-1',
  barbershopId: mockBarbershop.id,
  isActive: true,
  requiredStamps: 10,
  rewardDescription: 'Serviço grátis ao completar os selos',
};

export const mockSaaSPlans: SaaSPlan[] = [
  {
    id: 'p1',
    name: 'Starter',
    code: 'STARTER',
    description: 'Ideal para quem está começando sozinho.',
    price: 69.90,
    durationDays: 30,
    maxProfessionals: 1,
    features: ['1 Barbeiro', 'Agendamento Online 24/7', 'Agenda Digital', 'Suporte por E-mail'],
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Pro',
    code: 'PRO',
    description: 'Para barbearias em crescimento com equipe.',
    price: 129.90,
    durationDays: 30,
    maxProfessionals: 5,
    features: ['Até 5 Barbeiros', 'Relatórios Financeiros & Comissões', 'Gerador de Horário Vago (WhatsApp)', 'Programa de Fidelidade', 'Suporte via WhatsApp'],
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: 'Premium',
    code: 'PREMIUM',
    description: 'Operação completa, sem limite de barbeiros.',
    price: 249.90,
    durationDays: 30,
    maxProfessionals: 999,
    features: ['Barbeiros Ilimitados', 'Multi-unidades', 'Lembretes de Agendamento', 'Gestão de Estoque', 'Gerente de Conta Dedicado'],
    active: true,
    createdAt: new Date().toISOString(),
  },
];
