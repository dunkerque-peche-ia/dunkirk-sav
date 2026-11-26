'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginGateProps {
  onSuccess: () => void;
}

export default function LoginGate({ onSuccess }: LoginGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess();
      } else {
        setError(data.error || 'Mot de passe incorrect.');
      }
    } catch {
      setError('Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dunkirk-dark">
      <div className="w-full max-w-md bg-slate-900/80 border border-dunkirk-border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-dunkirk-gold to-dunkirk-goldHover p-0.5 shadow-gold-glow flex items-center justify-center">
            <div className="w-full h-full bg-dunkirk-dark rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-dunkirk-gold" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wider text-white">
              DUNKIRK <span className="text-dunkirk-gold">INFORMATIQUE</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Espace Atelier &amp; Prise en Charge SAV
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-dunkirk-gold" />
              Mot de passe d&apos;accès
            </label>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez le mot de passe atelier"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-dunkirk-gold"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-dunkirk-gold to-dunkirk-goldHover text-dunkirk-dark font-bold text-sm shadow-gold-glow hover:opacity-95 transition disabled:opacity-60"
          >
            <span>{loading ? 'Connexion...' : 'Accéder à l’application'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
