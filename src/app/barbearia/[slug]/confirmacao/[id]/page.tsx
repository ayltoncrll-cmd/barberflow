'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Scissors,
  UserCheck,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { mockStore } from '@/lib/store/mockStore';
import { formatCurrency, formatDateTimeBR, formatTimeBR, formatDateBR } from '@/lib/utils/formatters';
import { Appointment, Barbershop } from '@/types';

export default function ConfirmationPage({ params }: { params: { slug: string; id: string } }) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [shop, setShop] = useState<Barbershop | null>(null);

  useEffect(() => {
    const apps = mockStore.getAppointments();
    const app = apps.find((a) => a.id === params.id) || apps[0];
    setAppointment(app);
    setShop(mockStore.getBarbershop());
  }, [params.id]);

  if (!appointment || !shop) return null;

  const whatsappMessage = `Olá! Fiz um agendamento na ${shop.name} para ${formatDateBR(appointment.startTime)} às ${formatTimeBR(appointment.startTime)} (${appointment.serviceName}). Meu nome é ${appointment.customerName}.`;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${shop.phone.replace(/\D/g, '')}&text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-6 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 shadow-2xl animate-in zoom-in duration-300">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-white">Agendamento Confirmado!</h1>
          <p className="text-slate-400 text-sm mt-1">Seu horário foi reservado com sucesso no sistema da barbearia.</p>
        </div>

        {/* Details Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Código de Reserva</span>
            <span className="font-mono font-bold text-amber-400 text-sm">#{appointment.id.slice(-6).toUpperCase()}</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1.5"><Scissors className="w-4 h-4 text-amber-400" /> Serviço:</span>
              <span className="font-bold text-white">{appointment.serviceName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1.5"><UserCheck className="w-4 h-4 text-amber-400" /> Profissional:</span>
              <span className="font-bold text-white">{appointment.professionalName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-400" /> Data & Horário:</span>
              <span className="font-bold text-amber-400 font-mono">{formatDateTimeBR(appointment.startTime)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-amber-400" /> Endereço:</span>
              <span className="font-medium text-slate-300 text-xs text-right max-w-[200px]">{shop.address}</span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-base">
              <span className="text-slate-400 font-semibold">Valor Total:</span>
              <span className="font-extrabold text-amber-400 font-mono text-lg">{formatCurrency(appointment.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="gold" className="w-full py-3 text-base">
              <MessageSquare className="w-5 h-5" /> Falar com a Barbearia no WhatsApp
            </Button>
          </a>

          <Link href={`/barbearia/${params.slug}`} className="w-full">
            <Button variant="secondary" className="w-full">
              Fazer Outro Agendamento
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
