'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Scissors, 
  UserCheck, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { mockStore } from '@/lib/store/mockStore';
import { formatCurrency } from '@/lib/utils/formatters';
import { generateAvailableSlots, TimeSlot } from '@/lib/utils/scheduling';
import { Barbershop, Professional, Service, HolidayClosure } from '@/types';

export default function PublicBookingPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [shop, setShop] = useState<Barbershop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [holidays, setHolidays] = useState<HolidayClosure[]>([]);

  // Booking Flow Steps (1: Service, 2: Barber, 3: Date & Slot, 4: Client Info)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected Data
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Client Info Form
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadedShop = mockStore.getBarbershop();
    setShop(loadedShop);
    const loadedServices = mockStore.getServices().filter((s) => s.active);
    setServices(loadedServices);
    const loadedProfs = mockStore.getProfessionals().filter((p) => p.active);
    setProfessionals(loadedProfs);
    const loadedHolidays = mockStore.getHolidayClosures();
    setHolidays(loadedHolidays);
  }, []);

  // Recalculate available slots whenever date, prof, or service changes
  useEffect(() => {
    if (selectedService && selectedProfessional && selectedDate) {
      const appointments = mockStore.getAppointments().filter(
        (a) => a.professionalId === selectedProfessional.id && a.startTime.startsWith(selectedDate)
      );
      const blocks = mockStore.getScheduleBlocks().filter(
        (b) => (!b.professionalId || b.professionalId === selectedProfessional.id) && b.startTime.startsWith(selectedDate)
      );
      const bHours = mockStore.getBusinessHours();
      const pSchedules = mockStore.getProfessionalSchedules();
      const hClosures = mockStore.getHolidayClosures();

      const slots = generateAvailableSlots(
        selectedDate,
        selectedService.durationMinutes,
        bHours,
        pSchedules,
        appointments,
        blocks,
        hClosures
      );

      setAvailableSlots(slots);
      setSelectedTimeSlot('');
    }
  }, [selectedService, selectedProfessional, selectedDate]);

  if (!shop) return null;

  const currentHoliday = holidays.find((h) => h.date === selectedDate);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleProfSelect = (prof: Professional) => {
    setSelectedProfessional(prof);
    setStep(3);
  };

  const handleSlotSelect = (time: string) => {
    setSelectedTimeSlot(time);
    setStep(4);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTimeSlot) {
      setErrorMessage('Por favor selecione serviço, barbeiro, data e horário.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const result = mockStore.createAppointment({
        barbershopId: shop.id,
        customerName: clientName,
        customerPhone: clientPhone,
        professionalId: selectedProfessional.id,
        serviceId: selectedService.id,
        dateStr: selectedDate,
        timeStr: selectedTimeSlot,
        notes,
      });

      setIsLoading(false);

      if (result.success && result.appointment) {
        router.push(`/barbearia/${params.slug}/confirmacao/${result.appointment.id}`);
      } else {
        setErrorMessage(result.message || 'Erro ao realizar agendamento.');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 pb-16">
      {/* SHOP HEADER BANNER */}
      <header className="relative border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div className="max-w-xl mx-auto px-4 py-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20 text-slate-950 font-bold text-2xl border border-amber-400/30">
            <Scissors className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">{shop.name}</h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">{shop.description}</p>
          <div className="flex items-center justify-center gap-4 text-xs text-amber-400/90 font-medium">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {shop.city} - {shop.state}</span>
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {shop.phone}</span>
          </div>
        </div>
      </header>

      {/* STEPPER CONTAINER */}
      <main className="max-w-xl mx-auto px-4 mt-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-6 glass-panel p-3 rounded-2xl border border-slate-800 text-xs font-semibold">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-amber-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span> Serviço
          </div>
          <div className="w-6 h-0.5 bg-slate-800" />
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-amber-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span> Barbeiro
          </div>
          <div className="w-6 h-0.5 bg-slate-800" />
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span> Horário
          </div>
          <div className="w-6 h-0.5 bg-slate-800" />
          <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-amber-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">4</span> Confirmar
          </div>
        </div>

        {/* STEP 1: CHOOSE SERVICE */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-lg font-bold text-white mb-2">1. Selecione o Serviço Desejado:</h2>
            {services.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-400 text-sm space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
                <p className="font-semibold text-white">Nenhum serviço cadastrado ainda nesta barbearia.</p>
                <p className="text-xs text-slate-500">Cadastre serviços no painel administrativo (/dashboard/servicos) para aparecerem nesta tela.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-amber-500/60 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="pr-4">
                      <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{service.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> {service.durationMinutes} minutos
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-extrabold text-amber-400 font-mono">
                        {formatCurrency(service.price)}
                      </div>
                      <Button variant="gold" size="sm" className="mt-2 text-xs">
                        Escolher <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: CHOOSE BARBER */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">2. Escolha o Profissional:</h2>
              <button onClick={() => setStep(1)} className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar aos Serviços
              </button>
            </div>

            {professionals.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-400 text-sm space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
                <p className="font-semibold text-white">Nenhum barbeiro cadastrado ainda.</p>
                <p className="text-xs text-slate-500">Cadastre barbeiros no painel administrativo (/dashboard/profissionais).</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {professionals.map((prof) => (
                  <div
                    key={prof.id}
                    onClick={() => handleProfSelect(prof)}
                    className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-amber-500/60 cursor-pointer transition-all flex items-center space-x-4 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/30 overflow-hidden shrink-0">
                      {prof.avatarUrl ? (
                        <img src={prof.avatarUrl} alt={prof.name} className="w-full h-full object-cover" />
                      ) : (
                        prof.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                        {prof.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{prof.bio}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: CHOOSE DATE & TIME SLOT */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">3. Escolha Data e Horário:</h2>
              <button onClick={() => setStep(2)} className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Barbeiro
              </button>
            </div>

            {/* Date Input */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Data do Atendimento</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Holiday Notice Banner */}
            {currentHoliday && (
              <div className={`p-4 rounded-2xl border text-xs font-semibold space-y-1 ${
                currentHoliday.isClosed 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                <div className="font-bold text-sm flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4" /> {currentHoliday.title}
                </div>
                <div>
                  {currentHoliday.isClosed ? (
                    '★ A barbearia estará FECHADA nesta data especial. Escolha outro dia para agendar.'
                  ) : (
                    `★ Horário Especial de Funcionamento: das ${currentHoliday.openTime} às ${currentHoliday.closeTime}`
                  )}
                </div>
              </div>
            )}

            {/* Slots Grid */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Horários Disponíveis em Tempo Real:</div>

              {availableSlots.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  {currentHoliday?.isClosed
                    ? 'A barbearia estará fechada devido ao feriado. Escolha outro dia.'
                    : 'Não há horários disponíveis para esta data. Por favor escolha outro dia ou altere o barbeiro.'}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => handleSlotSelect(slot.time)}
                      className={`p-3 rounded-xl text-sm font-mono font-bold transition-all border text-center ${
                        slot.available
                          ? 'bg-slate-900 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border-amber-500/30 hover:border-amber-500 shadow-sm'
                          : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed line-through opacity-40'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: CLIENT CONTACT INFO & CONFIRMATION */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">4. Seus Dados de Contato:</h2>
              <button onClick={() => setStep(3)} className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Alterar Horário
              </button>
            </div>

            {/* Resume Card */}
            <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase font-semibold">Serviço:</span>
                <span className="text-white font-bold">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase font-semibold">Barbeiro:</span>
                <span className="text-white font-bold">{selectedProfessional?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase font-semibold">Data & Horário:</span>
                <span className="text-amber-400 font-mono font-bold">{selectedDate} às {selectedTimeSlot}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                <span className="text-slate-400 uppercase font-semibold">Valor Total:</span>
                <span className="text-amber-400 font-bold font-mono">{formatCurrency(selectedService?.price || 0)}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleConfirmBooking} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Seu Nome Completo</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  placeholder="Ex: Lucas Ferreira"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">WhatsApp (para confirmação)</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  placeholder="(11) 99999-8888"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Observações (Opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  placeholder="Ex: Prefiro tesoura no topo"
                />
              </div>

              <Button type="submit" variant="gold" className="w-full text-base py-3.5 mt-2" isLoading={isLoading}>
                Confirmar Agendamento <CheckCircle2 className="w-5 h-5 ml-1" />
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
