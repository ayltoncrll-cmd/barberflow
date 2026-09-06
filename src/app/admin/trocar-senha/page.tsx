'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ShieldAlert, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { mockStore } from '@/lib/store/mockStore';
import { isPasswordValid } from '@/lib/utils/password';

export default function TrocarSenhaAdminPage() {
  const router = useRouter();
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setIsFirstAccess(mockStore.getAdmin().mustChangePassword);
  }, []);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid(newPassword)) {
      setError('A nova senha ainda não atende a todos os requisitos de segurança.');
      return;
    }
    if (!passwordsMatch) {
      setError('As senhas não conferem. Digite a mesma senha nos dois campos.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = mockStore.changeAdminPassword(currentPassword, newPassword);
      setIsLoading(false);

      if (!result.success) {
        setError(result.message || 'Não foi possível alterar a senha.');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.replace('/admin'), 1200);
    }, 600);
  };

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/30">
            Admin do SaaS
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-purple-400" /> Alterar senha de administrador
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Escolha uma senha forte e exclusiva para o acesso administrativo da plataforma.
        </p>
      </div>

      {isFirstAccess && !success && (
        <div className="flex items-start gap-3 mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
          <div className="text-sm">
            <strong className="font-semibold text-amber-300">Primeiro acesso detectado.</strong> Você ainda está usando a
            senha padrão do sistema. Defina uma nova senha para liberar o painel administrativo.
          </div>
        </div>
      )}

      {success ? (
        <div className="glass-panel p-8 rounded-2xl border border-emerald-500/40 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Senha alterada com sucesso!</h2>
          <p className="text-sm text-slate-400">Redirecionando para o painel administrativo...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Senha atual
            </label>
            <PasswordInput
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Nova senha
              </label>
              <PasswordInput value={newPassword} onChange={setNewPassword} />
              <PasswordStrength password={newPassword} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Confirmar nova senha
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                invalid={confirmPassword.length > 0 && !passwordsMatch}
              />
              {confirmPassword && (
                <p
                  className={`mt-2 flex items-center gap-1.5 text-xs ${
                    passwordsMatch ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {passwordsMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {passwordsMatch ? 'As senhas conferem' : 'As senhas não conferem'}
                </p>
              )}
            </div>
          </div>

          {error && (
            <p className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <XCircle className="w-4 h-4 shrink-0" /> {error}
            </p>
          )}

          <Button type="submit" variant="gold" className="w-full text-base py-3" isLoading={isLoading}>
            Salvar nova senha <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>
      )}
    </main>
  );
}
