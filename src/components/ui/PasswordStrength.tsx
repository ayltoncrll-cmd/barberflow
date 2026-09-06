'use client';

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { getPasswordRules, PASSWORD_STRENGTH } from '@/lib/utils/password';

export const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  if (!password) return null;

  const rules = getPasswordRules(password);
  const score = rules.filter((r) => r.valid).length;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${PASSWORD_STRENGTH.barColors[score]}`}
            style={{ width: `${(score / rules.length) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-semibold ${PASSWORD_STRENGTH.textColors[score]}`}>
          {PASSWORD_STRENGTH.labels[score]}
        </span>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 text-xs ${rule.valid ? 'text-emerald-400' : 'text-slate-500'}`}
          >
            {rule.valid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
