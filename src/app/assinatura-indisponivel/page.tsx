'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scissors, Lock, MessageCircle, RefreshCw, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { adminData } from '@/lib/admin/adminData';
import { AdminBarbershopRow } from '@/types';
import { formatDateBR } from '@/lib/utils/formatters';
import { getBlockReason, SUBSCRIPTION_STATUS_LABEL, SUBSCRIPTION_STATUS_VARIANT } from '@/lib/utils/subscription';
import { mockStore } from '@/lib/store/mockStore';

const SUPPORT_WHATSAPP = '5511999998888';

export default function AssinaturaIndisponivelPage() {
  const router = useRouter();
  const [row, setRow] = useState<AdminBarbershopRow | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const current = adminData.getCurrentBarbershopRow();
    // Se o acesso já foi restabelecido pelo admin, volta direto ao painel.
    if (current?.hasAccess) {
      router.replace('/dashboard');
      return;
    }
    setRow(current);
    setChecking(false);
  }, [router]);

  const handleRecheck = () => {
    setChecking(true);
    const current = adminData.getCurrentBarbershopRow();
    if (current?.hasAccess) {
      router.replace('/dashboard');
      return;
    }
    setRow(current);
    setChecking(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
      </div>
    );
  }

  const reason = row
    ? getBlockReason(row.subscription, formatDateBR)
    : 'Não foi possível localizar a assinatura desta barbearia.';

  const supportMessage = encodeURIComponent(
    `Olá! Sou responsável pela ${row?.barbershop.name || 'minha barbearia'} e preciso regularizar minha assinatura do BarberFlow.`
  );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-950 text-slate-100 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Scissors className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Barber<span className="gold-gradient-text">Flow</span>
            </span>
          </Link>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-red-500/30 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-red-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Assinatura indisponível</h1>
            {row && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-sm text-slate-400">{row.barbershop.name}</span>
                <Badge variant={SUBSCRIPTION_STATUS_VARIANT[row.subscription.status]}>
                  {SUBSCRIPTION_STATUS_LABEL[row.subscription.status]}
                </Badge>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-300 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3.5 leading-relaxed">
            {reason}
          </p>

          {row && (
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Plano</div>
                <div className="text-sm font-semibold text-amber-400 mt-0.5">{row.plan?.name}</div>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Vencimento</div>
                <div className="text-sm font-mono text-slate-200 mt-0.5">
                  {formatDateBR(row.subscription.currentPeriodEnd)}
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500">
            Seus dados continuam salvos. Assim que a assinatura for regularizada, o acesso volta automaticamente.
          </p>

          <div className="space-y-2.5 pt-2">
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${supportMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="gold" className="w-full text-base py-3">
                <MessageCircle className="w-4 h-4" /> Entrar em contato
              </Button>
            </a>

            <Button variant="secondary" className="w-full" onClick={handleRecheck}>
              <RefreshCw className="w-4 h-4" /> Verificar novamente
            </Button>

            <button
              onClick={() => {
                mockStore.clearSession();
                router.push('/login');
              }}
              className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors pt-2 inline-flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Sair e voltar ao login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
