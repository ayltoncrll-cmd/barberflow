'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, KeyRound, ShieldAlert, RotateCcw, Database, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { mockStore } from '@/lib/store/mockStore';
import { adminData } from '@/lib/admin/adminData';
import { formatDateBR } from '@/lib/utils/formatters';
import { ConfirmDialog, Toast, ToastState, AdminLoading } from '@/components/admin/AdminUI';

export default function AdminConfiguracoesPage() {
  const [admin, setAdmin] = useState<ReturnType<typeof mockStore.getAdmin> | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setAdmin(mockStore.getAdmin());
  }, []);

  if (!admin) return <AdminLoading />;

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-400" /> Configurações
        </h1>
        <p className="text-sm text-slate-400 mt-1">Conta do administrador e dados da plataforma.</p>
      </header>

      {/* Conta do admin */}
      <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800">
        <h2 className="font-bold text-white flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <KeyRound className="w-4 h-4 text-purple-400" /> Conta do administrador
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Nome</div>
            <div className="text-sm text-slate-200 mt-1">{admin.name}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">E-mail de acesso</div>
            <div className="text-sm text-slate-200 mt-1 break-all">{admin.email}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Senha alterada em</div>
            <div className="text-sm text-slate-200 mt-1">
              {admin.passwordChangedAt ? formatDateBR(admin.passwordChangedAt) : 'Nunca'}
            </div>
          </div>
        </div>

        {admin.mustChangePassword && (
          <div className="flex items-start gap-3 mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>
              Você ainda está usando a senha padrão do sistema. Troque a senha para proteger o painel administrativo.
            </span>
          </div>
        )}

        <Link href="/admin/trocar-senha">
          <Button variant="gold" size="sm">
            <KeyRound className="w-4 h-4" /> Trocar senha
          </Button>
        </Link>
      </section>

      {/* Dados */}
      <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800">
        <h2 className="font-bold text-white flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <Database className="w-4 h-4 text-purple-400" /> Dados da plataforma
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Os dados do painel administrativo estão em modo de demonstração, salvos no navegador. A camada de dados fica
          isolada em <code className="text-purple-300 bg-slate-900 px-1.5 py-0.5 rounded text-xs">adminData.ts</code>,
          pronta para ser trocada pelo Supabase sem alterar as telas.
        </p>
        <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)}>
          <RotateCcw className="w-4 h-4" /> Restaurar dados de demonstração
        </Button>
      </section>

      {/* Integração futura */}
      <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800">
        <h2 className="font-bold text-white mb-3 pb-3 border-b border-slate-800">Cobrança automática</h2>
        <p className="text-sm text-slate-400">
          O controle de assinaturas é <strong className="text-slate-200">manual</strong> neste momento, feito por esta
          administração. A arquitetura já está preparada para receber uma integração de pagamento futuramente — os
          status e as datas de vencimento são a fonte de verdade do acesso.
        </p>
        <Link
          href="/admin/assinaturas"
          className="inline-flex items-center gap-1 text-sm text-purple-400 hover:underline font-semibold mt-3"
        >
          Ir para assinaturas <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      <ConfirmDialog
        isOpen={confirmReset}
        title="Restaurar dados de demonstração"
        message={
          <>
            Isso recria as barbearias, planos e assinaturas de exemplo do painel administrativo, descartando as
            alterações feitas aqui. <strong className="text-white">Os dados da barbearia no /dashboard não são afetados.</strong>
          </>
        }
        confirmLabel="Restaurar dados"
        variant="danger"
        onConfirm={() => {
          adminData.resetSeed();
          setConfirmReset(false);
          setToast({ type: 'success', message: 'Dados de demonstração restaurados.' });
        }}
        onClose={() => setConfirmReset(false)}
      />
    </div>
  );
}
