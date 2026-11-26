'use client';

import React from 'react';
import { 
  ClipboardList, 
  PlusCircle, 
  Settings, 
  Database, 
  Laptop, 
  Phone, 
  ShieldCheck,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { BaserowConfig } from '@/types/sav';

interface HeaderProps {
  activeTab: 'intake' | 'dashboard' | 'settings';
  setActiveTab: (tab: 'intake' | 'dashboard' | 'settings') => void;
  baserowConfig: BaserowConfig;
  serverBaserowConfigured?: boolean;
  pendingSyncCount: number;
  onSyncAll: () => void;
  onRefreshFromBaserow?: () => void;
  isSyncing: boolean;
  authRequired?: boolean;
  onLogout?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  baserowConfig,
  serverBaserowConfigured = false,
  pendingSyncCount,
  onSyncAll,
  onRefreshFromBaserow,
  isSyncing,
  authRequired = false,
  onLogout
}: HeaderProps) {
  const isBaserowConfigured = Boolean(
    serverBaserowConfigured ||
    (baserowConfig.apiUrl && baserowConfig.databaseToken && baserowConfig.tableId)
  );

  return (
    <header className="bg-dunkirk-dark border-b border-dunkirk-border sticky top-0 z-40 print:hidden shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Identité Dunkirk Informatique SAV */}
          <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            {/* Blason stylisé d'or */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-dunkirk-gold to-dunkirk-goldHover p-0.5 shadow-gold-glow flex items-center justify-center">
              <div className="w-full h-full bg-dunkirk-dark rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-dunkirk-gold" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-white font-extrabold tracking-wider text-base sm:text-lg">DUNKIRK</span>
                <span className="text-dunkirk-gold font-extrabold tracking-wider text-base sm:text-lg">INFORMATIQUE</span>
                <span className="ml-2 px-2 py-0.5 text-[11px] font-bold rounded-md bg-dunkirk-navy text-dunkirk-gold border border-dunkirk-gold/30">
                  SAV ATELIER
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>Prise en charge matériel & maintenance</span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="hidden sm:inline text-dunkirk-goldBright font-medium">03 39 91 26 59</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setActiveTab('intake')}
              className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                activeTab === 'intake'
                  ? 'bg-gradient-to-r from-dunkirk-gold to-dunkirk-goldHover text-dunkirk-dark shadow-gold-glow scale-105'
                  : 'bg-dunkirk-navy/70 text-slate-300 hover:text-white hover:bg-dunkirk-navy border border-dunkirk-border'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden md:inline">Nouvelle Prise en Charge</span>
              <span className="md:hidden">Nouveau</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-dunkirk-navy text-white border-2 border-dunkirk-gold shadow-md'
                  : 'bg-dunkirk-navy/70 text-slate-300 hover:text-white hover:bg-dunkirk-navy border border-dunkirk-border'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-dunkirk-gold" />
              <span>Dossiers SAV</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 px-3 sm:px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'bg-dunkirk-navy text-white border-2 border-dunkirk-gold shadow-md'
                  : 'bg-dunkirk-navy/50 text-slate-400 hover:text-white hover:bg-dunkirk-navy border border-dunkirk-border'
              }`}
              title="Configuration Baserow & Paramètres"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline">Baserow & Config</span>
            </button>

            {isBaserowConfigured && onRefreshFromBaserow && (
              <button
                onClick={onRefreshFromBaserow}
                disabled={isSyncing}
                className="lg:hidden flex items-center justify-center p-2.5 rounded-xl bg-dunkirk-navy/70 text-emerald-300 hover:bg-dunkirk-navy border border-dunkirk-border transition"
                title="Actualiser depuis Baserow"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}

            {authRequired && onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center justify-center p-2.5 rounded-xl bg-dunkirk-navy/50 text-slate-400 hover:text-rose-300 hover:bg-dunkirk-navy border border-dunkirk-border transition"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </nav>

          {/* Statut de synchronisation Baserow */}
          <div className="hidden lg:flex items-center space-x-3 pl-3 border-l border-slate-800">
            {isBaserowConfigured ? (
              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" />
                  <span>Baserow Connecté</span>
                </span>
                {onRefreshFromBaserow && (
                  <button
                    onClick={onRefreshFromBaserow}
                    disabled={isSyncing}
                    className="ml-1 text-[11px] bg-emerald-500/15 text-emerald-200 px-2 py-0.5 rounded-md hover:bg-emerald-500/25 flex items-center gap-1 transition"
                    title="Actualiser les dossiers depuis Baserow"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                )}
                {pendingSyncCount > 0 && (
                  <button
                    onClick={onSyncAll}
                    disabled={isSyncing}
                    className="ml-1 text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md hover:bg-amber-500/30 flex items-center gap-1 transition"
                    title="Cliquez pour synchroniser les tickets en attente"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{pendingSyncCount} en attente</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center space-x-1.5 bg-amber-500/15 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-amber-500/25 transition"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Baserow à configurer</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
