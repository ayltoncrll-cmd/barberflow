import { 
  Barbershop, 
  Professional, 
  Service, 
  Customer, 
  Appointment, 
  ScheduleBlock, 
  AppointmentStatus,
  BusinessHour,
  ProfessionalSchedule,
  HolidayClosure,
  LoyaltyProgram
} from '@/types';
import { 
  mockBarbershop, 
  mockProfessionals, 
  mockServices, 
  mockCustomers, 
  mockAppointments, 
  mockScheduleBlocks,
  mockBusinessHours,
  mockProfessionalSchedules,
  mockLoyaltyProgram
} from './mockData';

const STORAGE_KEYS = {
  BARBERSHOP: 'barberflow_barbershop',
  PROFESSIONALS: 'barberflow_professionals',
  SERVICES: 'barberflow_services',
  CUSTOMERS: 'barberflow_customers',
  APPOINTMENTS: 'barberflow_appointments',
  BLOCKS: 'barberflow_blocks',
  BUSINESS_HOURS: 'barberflow_business_hours',
  PROFESSIONAL_SCHEDULES: 'barberflow_prof_schedules',
  HOLIDAYS: 'barberflow_holidays',
  ACCOUNT: 'barberflow_account',
};

export interface StoredAccount {
  email: string;
  password: string;
  ownerName: string;
  createdAt: string;
}

const FICTITIOUS_NAMES = ['Felipe Alcantara', 'Guilherme Rocha', 'Rodrigo Santoro'];

class BarberFlowStore {
  private getStorage<T>(key: string, defaultVal: T): T {
    if (typeof window === 'undefined') return defaultVal;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setStorage<T>(key: string, val: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('Error writing to storage:', e);
    }
  }

  clearAllData(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }

  // ACCOUNT (credenciais de acesso do dono da barbearia)
  getAccount(): StoredAccount | null {
    return this.getStorage<StoredAccount | null>(STORAGE_KEYS.ACCOUNT, null);
  }

  saveAccount(account: Omit<StoredAccount, 'createdAt'>): StoredAccount {
    const stored: StoredAccount = { ...account, createdAt: new Date().toISOString() };
    this.setStorage(STORAGE_KEYS.ACCOUNT, stored);
    return stored;
  }

  authenticate(email: string, password: string): { success: boolean; message?: string } {
    const account = this.getAccount();
    if (!account) {
      return { success: false, message: 'Nenhuma conta cadastrada neste navegador. Cadastre sua barbearia primeiro.' };
    }
    if (account.email.trim().toLowerCase() !== email.trim().toLowerCase() || account.password !== password) {
      return { success: false, message: 'E-mail ou senha inválidos.' };
    }
    return { success: true };
  }

  // BARBERSHOP
  getBarbershop(): Barbershop {
    return this.getStorage(STORAGE_KEYS.BARBERSHOP, mockBarbershop);
  }

  updateBarbershop(data: Partial<Barbershop>): Barbershop {
    const current = this.getBarbershop();
    const updated = { ...current, ...data };
    this.setStorage(STORAGE_KEYS.BARBERSHOP, updated);
    return updated;
  }

  // PROFESSIONALS
  getProfessionals(): Professional[] {
    return this.getStorage(STORAGE_KEYS.PROFESSIONALS, mockProfessionals);
  }

  addProfessional(prof: Omit<Professional, 'id' | 'createdAt'>): Professional {
    const current = this.getProfessionals();
    const newProf: Professional = {
      ...prof,
      id: `prof-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newProf, ...current];
    this.setStorage(STORAGE_KEYS.PROFESSIONALS, updated);

    // Auto-generate default 6-day working schedules for new professional (Seg-Sáb 08:00-19:00, almoço 12:00-13:00)
    const schedules = this.getProfessionalSchedules();
    const newSchedules: ProfessionalSchedule[] = [];
    for (let day = 0; day <= 6; day++) {
      newSchedules.push({
        id: `ps-${newProf.id}-${day}`,
        professionalId: newProf.id,
        dayOfWeek: day,
        startTime: '08:00',
        endTime: '19:00',
        breakStart: '12:00',
        breakEnd: '13:00',
        isWorking: day !== 0, // Closed on Sundays by default
      });
    }
    this.setStorage(STORAGE_KEYS.PROFESSIONAL_SCHEDULES, [...schedules, ...newSchedules]);

    return newProf;
  }

  updateProfessional(id: string, data: Partial<Professional>): Professional | null {
    const current = this.getProfessionals();
    const idx = current.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    current[idx] = { ...current[idx], ...data };
    this.setStorage(STORAGE_KEYS.PROFESSIONALS, current);
    return current[idx];
  }

  deleteProfessional(id: string): void {
    const current = this.getProfessionals().filter((p) => p.id !== id);
    this.setStorage(STORAGE_KEYS.PROFESSIONALS, current);
  }

  // SERVICES
  getServices(): Service[] {
    return this.getStorage(STORAGE_KEYS.SERVICES, mockServices);
  }

  addService(service: Omit<Service, 'id' | 'createdAt'>): Service {
    const current = this.getServices();
    const newService: Service = {
      ...service,
      id: `s-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newService, ...current];
    this.setStorage(STORAGE_KEYS.SERVICES, updated);
    return newService;
  }

  updateService(id: string, data: Partial<Service>): Service | null {
    const current = this.getServices();
    const idx = current.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    current[idx] = { ...current[idx], ...data };
    this.setStorage(STORAGE_KEYS.SERVICES, current);
    return current[idx];
  }

  deleteService(id: string): void {
    const current = this.getServices().filter((s) => s.id !== id);
    this.setStorage(STORAGE_KEYS.SERVICES, current);
  }

  // CUSTOMERS
  getCustomers(): Customer[] {
    const raw = this.getStorage(STORAGE_KEYS.CUSTOMERS, mockCustomers);
    return raw.filter((c) => !FICTITIOUS_NAMES.includes(c.name));
  }

  findOrCreateCustomer(name: string, phone: string, whatsapp?: string): Customer {
    const current = this.getCustomers();
    const existing = current.find((c) => c.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''));
    if (existing) {
      return existing;
    }
    const newCustomer: Customer = {
      id: `c-${Date.now()}`,
      barbershopId: mockBarbershop.id,
      name,
      phone,
      whatsapp: whatsapp || phone,
      firstVisitAt: new Date().toISOString(),
      lastVisitAt: new Date().toISOString(),
      totalVisits: 1,
      totalSpent: 0,
      stampsCount: 1,
      createdAt: new Date().toISOString(),
    };
    this.setStorage(STORAGE_KEYS.CUSTOMERS, [newCustomer, ...current]);
    return newCustomer;
  }

  deleteCustomer(id: string): void {
    const current = this.getCustomers().filter((c) => c.id !== id);
    this.setStorage(STORAGE_KEYS.CUSTOMERS, current);
  }

  // APPOINTMENTS
  getAppointments(): Appointment[] {
    const raw = this.getStorage(STORAGE_KEYS.APPOINTMENTS, mockAppointments);
    return raw.filter((app) => 
      !['app-1', 'app-2', 'app-3'].includes(app.id) && 
      !FICTITIOUS_NAMES.includes(app.customerName || '')
    );
  }

  createAppointment(payload: {
    barbershopId: string;
    customerName: string;
    customerPhone: string;
    professionalId: string;
    serviceId: string;
    dateStr: string; // YYYY-MM-DD
    timeStr: string; // HH:mm
    notes?: string;
  }): { success: boolean; appointment?: Appointment; message?: string } {
    const appointments = this.getAppointments();
    const professionals = this.getProfessionals();
    const services = this.getServices();

    const prof = professionals.find((p) => p.id === payload.professionalId);
    const service = services.find((s) => s.id === payload.serviceId);

    if (!prof || !service) {
      return { success: false, message: 'Profissional ou Serviço não encontrado. Cadastre serviços e barbeiros primeiro.' };
    }

    const startISO = `${payload.dateStr}T${payload.timeStr}:00`;
    const startMs = new Date(startISO).getTime();
    const endMs = startMs + service.durationMinutes * 60 * 1000;
    const endISO = new Date(endMs).toISOString();

    const conflicting = appointments.find((app) => {
      if (app.professionalId !== payload.professionalId || app.status === 'CANCELLED') return false;
      const appStart = new Date(app.startTime).getTime();
      const appEnd = new Date(app.endTime).getTime();
      return (
        (startMs >= appStart && startMs < appEnd) ||
        (endMs > appStart && endMs <= appEnd) ||
        (startMs <= appStart && endMs >= appEnd)
      );
    });

    if (conflicting) {
      return {
        success: false,
        message: 'Este horário acabou de ser reservado por outro cliente. Por favor escolha outro horário.',
      };
    }

    const customer = this.findOrCreateCustomer(payload.customerName, payload.customerPhone);

    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      barbershopId: payload.barbershopId,
      customerId: customer.id,
      professionalId: prof.id,
      serviceId: service.id,
      startTime: startISO,
      endTime: endISO,
      totalPrice: service.price,
      status: 'SCHEDULED',
      notes: payload.notes,
      createdAt: new Date().toISOString(),
      customerName: customer.name,
      customerPhone: customer.phone,
      professionalName: prof.name,
      serviceName: service.name,
      serviceDuration: service.durationMinutes,
    };

    const updatedApps = [newApp, ...appointments];
    this.setStorage(STORAGE_KEYS.APPOINTMENTS, updatedApps);

    return { success: true, appointment: newApp };
  }

  updateAppointmentStatus(id: string, newStatus: AppointmentStatus): Appointment | null {
    const appointments = this.getAppointments();
    const idx = appointments.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    const oldStatus = appointments[idx].status;
    appointments[idx].status = newStatus;

    if (newStatus === 'COMPLETED' && oldStatus !== 'COMPLETED') {
      const customers = this.getCustomers();
      const cIdx = customers.findIndex((c) => c.id === appointments[idx].customerId);
      if (cIdx !== -1) {
        customers[cIdx].totalVisits = (customers[cIdx].totalVisits || 0) + 1;
        customers[cIdx].totalSpent = (customers[cIdx].totalSpent || 0) + appointments[idx].totalPrice;
        customers[cIdx].stampsCount = (customers[cIdx].stampsCount || 0) + 1;
        customers[cIdx].lastVisitAt = new Date().toISOString();
        this.setStorage(STORAGE_KEYS.CUSTOMERS, customers);
      }
    }

    this.setStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
    return appointments[idx];
  }

  deleteAppointment(id: string): void {
    const current = this.getAppointments().filter((a) => a.id !== id);
    this.setStorage(STORAGE_KEYS.APPOINTMENTS, current);
  }

  // BLOCKS
  getScheduleBlocks(): ScheduleBlock[] {
    return this.getStorage(STORAGE_KEYS.BLOCKS, mockScheduleBlocks);
  }

  addScheduleBlock(block: Omit<ScheduleBlock, 'id'>): ScheduleBlock {
    const current = this.getScheduleBlocks();
    const newBlock: ScheduleBlock = {
      ...block,
      id: `block-${Date.now()}`,
    };
    const updated = [newBlock, ...current];
    this.setStorage(STORAGE_KEYS.BLOCKS, updated);
    return newBlock;
  }

  deleteScheduleBlock(id: string): void {
    const current = this.getScheduleBlocks().filter((b) => b.id !== id);
    this.setStorage(STORAGE_KEYS.BLOCKS, current);
  }

  // BUSINESS HOURS (Shop Operating Hours per day 0-6)
  getBusinessHours(): BusinessHour[] {
    return this.getStorage(STORAGE_KEYS.BUSINESS_HOURS, mockBusinessHours);
  }

  updateBusinessHours(hours: BusinessHour[]): void {
    this.setStorage(STORAGE_KEYS.BUSINESS_HOURS, hours);
  }

  // PROFESSIONAL SCHEDULES (Barber shift per day 0-6)
  getProfessionalSchedules(): ProfessionalSchedule[] {
    return this.getStorage(STORAGE_KEYS.PROFESSIONAL_SCHEDULES, mockProfessionalSchedules);
  }

  updateProfessionalSchedules(schedules: ProfessionalSchedule[]): void {
    this.setStorage(STORAGE_KEYS.PROFESSIONAL_SCHEDULES, schedules);
  }

  // HOLIDAY CLOSURES & SPECIAL DAYS
  getHolidayClosures(): HolidayClosure[] {
    return this.getStorage<HolidayClosure[]>(STORAGE_KEYS.HOLIDAYS, []);
  }

  addHolidayClosure(holiday: Omit<HolidayClosure, 'id'>): HolidayClosure {
    const current = this.getHolidayClosures();
    const newHoliday: HolidayClosure = {
      ...holiday,
      id: `hol-${Date.now()}`,
    };
    const updated = [newHoliday, ...current];
    this.setStorage(STORAGE_KEYS.HOLIDAYS, updated);
    return newHoliday;
  }

  deleteHolidayClosure(id: string): void {
    const current = this.getHolidayClosures().filter((h) => h.id !== id);
    this.setStorage(STORAGE_KEYS.HOLIDAYS, current);
  }

  getLoyaltyProgram(): LoyaltyProgram {
    return mockLoyaltyProgram;
  }
}

export const mockStore = new BarberFlowStore();
