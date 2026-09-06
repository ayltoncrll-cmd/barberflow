'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  /** Aplica estilo de erro (borda vermelha) no campo. */
  invalid?: boolean;
  /** Mostra o ícone de cadeado à esquerda. */
  withIcon?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'new-password',
  required = true,
  invalid = false,
  withIcon = true,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {withIcon && <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />}
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`w-full ${withIcon ? 'pl-11' : 'pl-4'} pr-12 py-3 rounded-xl bg-slate-900/90 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors text-sm ${
          invalid
            ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500'
            : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500'
        }`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        className="absolute right-3.5 top-3.5 text-slate-500 hover:text-amber-400 transition-colors"
      >
        {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
};
