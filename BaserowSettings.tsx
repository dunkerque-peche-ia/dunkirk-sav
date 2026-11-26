'use client';

import React, { useState } from 'react';
import { BaserowConfig } from '@/types/sav';
import {
  RECOMMENDED_BASEROW_SCHEMA,
  testBaserowConnection,
} from '@/services/baserow';
import {
  Database,
  KeyRound,
  Hash,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Save,
  RefreshCw,
  Table,
} from 'lucide-react';

interface BaserowSettingsProps {
  config: BaserowConfig;
  serverConfigured?: boolean;
  onSaveConfig: (newConfig: BaserowConfig) => void;
  onSyncAll: () => Promise<{ syncedCount: number; errorCount: number; errors: string[] }>;
  pendingCount: number;
}

export default function BaserowSettings({
  config,
  serverConfigured = false,
  onSaveConfig,
  onSyncAll,
  pendingCount,
}: BaserowSettingsProps) {
  const [apiUrl, setApiUrl] = useState(config.apiUrl || 'https://api.baserow.io');
  const [databaseToken, setDatabaseToken] = useState(config.databaseToken || '');
  const [tableId, setTableId] = useState(config.tableId || '');

  const [testStatus, setTestStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [syncingAll, setSyncingAll] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Test de connexion à Baserow en cours...');

    const res = await testBaserowConnection({
      apiUrl,
      databaseToken,
      tableId,
      autoSyncOnSave: true,
      userFieldNames: true,
    });

    if (res.success) {
      setTestStatus('success');
      setTestMessage(res.message);
    } else {
      setTestStatus('error');
      setTestMessage(res.message);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      apiUrl: apiUrl.trim(),
      databaseToken: databaseToken.trim(),
      tableId: tableId.trim(),
      autoSyncOnSave: true,
      userFieldNames: true,
    });
    alert('Configuration Baserow enregistrée avec succès !');
  };

  const handleSyncAllClick = async () => {
    setSyncingAll(true);
    try {
      const res = await onSyncAll();
      alert(`Synchronisation terminée :\n${res.syncedCount} dossier(s) synchronisé(s), ${res.errorCount} échec(s).`);
    } finally {
      setSyncingAll(false);
    }
  };

  const handleCopySchemaList = () => {
    const text = RECOMMENDED_BASEROW_SCHEMA.map(
      (f) => `• ${f.name} (${f.type}) : ${f.desc}`
    ).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Configuration Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Paramètres de Connexion Baserow
            </h2>
            <p className="text-xs text-slate-400">
              Associez votre base de données Baserow pour sauvegarder et synchroniser automatiquement chaque prise en charge SAV.
            </p>
          </div>
        </div>

        {serverConfigured && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-300">
                Configuration sécurisée active côté serveur (.env.local / variables d&apos;environnement)
              </p>
              <p className="text-emerald-200/80 mt-0.5">
                Votre token Baserow est protégé sur le serveur : tous vos appareils (PC et smartphones) se connectent automatiquement sans exposer la clé API dans le navigateur. Les champs ci-dessous restent optionnels si vous souhaitez tester une autre table.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* API URL */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                URL de l&apos;API Baserow
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.baserow.io"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Utilisez <code className="text-amber-400">https://api.baserow.io</code> pour le cloud Baserow officiel, ou l&apos;URL de votre instance auto-hébergée.
              </p>
            </div>

            {/* Token */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                Jeton d&apos;API Base de données (Database Token)
              </label>
              <input
                type="password"
                value={databaseToken}
                onChange={(e) => setDatabaseToken(e.target.value)}
                placeholder="Ex: 8XkL9wPz... ou JWT Token"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Créez un Database Token dans Baserow &gt; Paramètres du compte &gt; Database tokens avec droits en lecture/écriture.
              </p>
            </div>

            {/* Table ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                ID de la Table SAV (Table ID)
              </label>
              <input
                type="text"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                placeholder="Ex: 341829"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Visible dans l&apos;URL de votre table Baserow : <code className="text-slate-400">/database/ID_DATABASE/table/&lt;TABLE_ID&gt;</code>
              </p>
            </div>
          </div>

          {/* Test connection alert */}
          {testStatus !== 'idle' && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                testStatus === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : testStatus === 'error'
                  ? 'bg-red-950/40 border-red-500/40 text-red-200'
                  : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
              }`}
            >
              {testStatus === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : testStatus === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-spin" />
              )}
              <div>
                <p className="font-semibold">{testMessage}</p>
                {testStatus === 'error' && (
                  <p className="mt-1 text-[11px] text-red-300/80">
                    Vérifiez que votre token a bien les autorisations sur cette table et que l&apos;ID de la table est numérique.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={testStatus === 'testing' || !databaseToken || !tableId}
              onClick={handleTestConnection}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
              <span>Tester la Connexion API</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer la Configuration</span>
            </button>
          </div>
        </form>
      </div>

      {/* Manual Sync Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            File de Synchronisation
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {pendingCount > 0
              ? `Il y a actuellement ${pendingCount} dossier(s) en attente de synchronisation vers Baserow.`
              : 'Tous vos dossiers locaux sont synchronisés avec Baserow.'}
          </p>
        </div>

        <button
          onClick={handleSyncAllClick}
          disabled={syncingAll || pendingCount === 0 || !databaseToken || !tableId}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0B2244] hover:bg-[#123366] text-amber-400 border border-amber-400/40 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin' : ''}`} />
          <span>Synchroniser les {pendingCount} dossier(s)</span>
        </button>
      </div>

      {/* Schema Helper / Field List */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Table className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">
              Structure de la Table Baserow recommandée
            </h3>
          </div>
          <button
            onClick={handleCopySchemaList}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs border border-slate-700 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedSchema ? 'Copié !' : 'Copier la liste des champs'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Dans Baserow, créez une table avec les colonnes suivantes (noms exacts recommandés pour un mappage automatique sans configuration supplémentaire) :
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          {RECOMMENDED_BASEROW_SCHEMA.map((field) => (
            <div
              key={field.name}
              className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between"
            >
              <span className="text-amber-300 font-semibold">{field.name}</span>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {field.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
