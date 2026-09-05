import { Barbershop, Professional, Service, Customer, Appointment, ScheduleBlock, BusinessHour, ProfessionalSchedule, SaaSPlan, LoyaltyProgram } from '@/types';

export const mockBarbershop: Barbershop = {
  id: 'b1111111-1111-1111-1111-111111111111',
  name: 'Sua Barbearia',
  slug: 'sua-barbearia',
  ownerId: 'u2222222-2222-2222-2222-222222222222',
  phone: '(11) 99999-9999',
  whatsapp: '(11) 99999-9999',
  email: 'contato@suabarbearia.com',
  city: 'Sua Cidade',
  state: 'UF',
  address: 'Rua Principal, 100 - Centro',
  description: 'Barbearia moderna com agendamento online 24h.',
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
  rewardDescription: '1 Serviço Grátis ao completar 10 selos',
};

export const mockSaaSPlans: SaaSPlan[] = [
  {
    id: 'p1',
    name: 'Starter',
    code: 'STARTER',
    price: 69.90,
    maxProfessionals: 1,
    features: ['1 Barbeiro', 'Agendamento Online 24/7', 'Agenda Digital', 'Suporte por E-mail'],
  },
  {
    id: 'p2',
    name: 'Pro',
    code: 'PRO',
    price: 129.90,
    maxProfessionals: 5,
    features: ['Até 5 Barbeiros', 'Relatórios Financeiros & Comissões', 'Gerador de Horário Vago (WhatsApp)', 'Programa de Fidelidade', 'Suporte via WhatsApp'],
  },
  {
    id: 'p3',
    name: 'Premium',
    code: 'PREMIUM',
    price: 249.90,
    maxProfessionals: 999,
    features: ['Barbeiros Ilimitados', 'Multi-unidades', 'Lembretes de Agendamento', 'Gestão de Estoque', 'Gerente de Conta Dedicado'],
  },
];
