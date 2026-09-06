import React from 'react';
import Link from 'next/link';
import {
  Scissors,
  Calendar,
  TrendingUp,
  Users,
  ShieldCheck,
  Smartphone,
  MessageSquare,
  Award,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SaaSPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Scissors className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Barber<span className="gold-gradient-text">Flow</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#recursos" className="hover:text-amber-400 transition-colors">Recursos</a>
            <a href="#planos" className="hover:text-amber-400 transition-colors">Planos & Preços</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/onboarding">
              <Button variant="gold" size="sm">
                Criar Barbearia <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" /> Plataforma SaaS Multi-tenant Completa
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Transforme sua barbearia em uma <span className="gold-gradient-text">máquina de agendamentos</span> e faturamento.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Agendamento online 24h em 30 segundos, controle de comissões, gestão de caixa, programa de fidelidade e WhatsApp integrado em um único lugar.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button variant="gold" size="lg" className="w-full text-base px-8 py-4">
                Testar Grátis por 14 Dias <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-base px-8 py-4">
                Já tenho conta
              </Button>
            </Link>
          </div>

          {/* SaaS Mockup / Preview Banner */}
          <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl glass-panel p-4 sm:p-6 border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-mono text-slate-500">barberflow.com/barbearia/sua-barbearia</span>
              <span className="hidden sm:inline bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">Prévia da interface</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="glass-card p-5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Faturamento Hoje</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">Caixa do dia</div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <span>Comparativo automático com o dia anterior</span>
                </div>
              </div>

              <div className="glass-card p-5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Atendimentos Hoje</span>
                  <Calendar className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white">Agenda do dia</div>
                <div className="text-xs text-amber-400 mt-1">Concluídos e a atender, em tempo real</div>
              </div>

              <div className="glass-card p-5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Comissões a Pagar</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">Comissões</div>
                <div className="text-xs text-slate-400 mt-1">Calculadas por barbeiro automaticamente</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KEY FEATURES SECTION */}
      <section id="recursos" className="py-24 border-t border-slate-800/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Tudo que sua barbearia precisa</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">Recursos desenvolvidos sob medida para Barbeiros e Gerentes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Página Pública Super Rápida</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Seu cliente escolhe o serviço, barbeiro, data e horário em menos de 30 segundos sem precisar baixar nenhum aplicativo ou criar senhas.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Prevenção de Duplo Agendamento</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Motor de disponibilidade que valida horários no servidor, considerando expediente, intervalos, folgas e bloqueios simultâneos.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Financeiro & Comissões</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Cálculo automático das comissões de cada barbeiro conforme os serviços concluídos. Faturamento do dia, semana e mês em tempo real.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Recurso Horário Vago</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Teve um cancelamento? O sistema gera uma mensagem pronta com um clique para divulgar a vaga no Instagram e WhatsApp.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Programa de Fidelidade</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Defina uma recompensa (ex: a cada 10 cortes o cliente ganha 1 grátis) e acompanhe o selo digital de cada cliente no cadastro.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-tenant 100% Seguro</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Arquitetura SaaS com isolamento rigoroso entre contas (RLS). Nenhuma barbearia pode visualizar ou acessar dados de outra.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="planos" className="py-24 border-t border-slate-800/60 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Planos acessíveis</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">Escolha o plano ideal para a sua barbearia</p>
            <p className="text-slate-400 mt-4 text-sm">Sem fidelidade. Cancele ou altere a qualquer momento.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Starter */}
            <div className="glass-card p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                <p className="text-slate-400 text-xs mb-6">Ideal para barbeiros autônomos</p>
                <div className="text-4xl font-extrabold text-white mb-6">
                  R$ 69<span className="text-lg text-slate-400 font-normal">,90/mês</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>1 Barbeiro ativo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Página pública exclusiva</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Agendamento 24h ilimitado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Gestão de Clientes</span>
                  </li>
                </ul>
              </div>
              <Link href="/onboarding">
                <Button variant="secondary" className="w-full">Começar no Starter</Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="glass-card p-8 rounded-2xl border-2 border-amber-500/60 relative flex flex-col justify-between shadow-2xl shadow-amber-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                Mais Popular
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                <p className="text-slate-400 text-xs mb-6">Para barbearias em crescimento</p>
                <div className="text-4xl font-extrabold text-white mb-6">
                  R$ 129<span className="text-lg text-slate-400 font-normal">,90/mês</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Até 5 Barbeiros</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Cálculo automático de comissões</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Divulgação Horário Vago (WhatsApp)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Programa de Fidelidade Digital</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Relatórios Financeiros Avançados</span>
                  </li>
                </ul>
              </div>
              <Link href="/onboarding">
                <Button variant="gold" className="w-full">Começar Teste de 14 Dias</Button>
              </Link>
            </div>

            {/* Premium */}
            <div className="glass-card p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
                <p className="text-slate-400 text-xs mb-6">Para grandes redes e franquias</p>
                <div className="text-4xl font-extrabold text-white mb-6">
                  R$ 249<span className="text-lg text-slate-400 font-normal">,90/mês</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Barbeiros Ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Multi-unidades / Filiais</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Suporte Prioritário 24/7</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Customização de Marca</span>
                  </li>
                </ul>
              </div>
              <Link href="/onboarding">
                <Button variant="secondary" className="w-full">Falar com Consultor</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800/80 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-400">
          <div className="flex items-center space-x-2">
            <Scissors className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-white">BarberFlow SaaS</span>
            <span>© 2026. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-xs text-slate-500">Desenvolvido em Next.js & Supabase</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
