import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Download, Database, Shield, CheckCircle2, AlertTriangle, FileArchive } from 'lucide-react';
import { AppSettings, UserProfile } from '../../types/stock';
import { AuditLog } from '../../types/production';
import { translations, Language } from '../../lib/i18n';

interface SettingsViewProps {
  settings: AppSettings;
  profiles: UserProfile[];
  currentRole: 'admin' | 'operateur';
  isOnline: boolean;
  auditLogs: AuditLog[];
  lang: Language;
  onSaveSettings: (updated: AppSettings) => void;
  onSyncSupabase: () => void;
  onDownloadZip: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  profiles,
  currentRole,
  isOnline,
  auditLogs,
  lang,
  onSaveSettings,
  onSyncSupabase,
  onDownloadZip
}) => {
  const t = translations[lang];

  const [companyName, setCompanyName] = useState(settings.company_name);
  const [arabicSubtitle, setArabicSubtitle] = useState(settings.arabic_subtitle);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [threshold, setThreshold] = useState(settings.threshold || 85);
  const [oilDensity, setOilDensity] = useState(settings.oil_density || 0.918);
  const [defaultFeeRate, setDefaultFeeRate] = useState(settings.default_milling_fee_per_kg || 0.080);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      company_name: companyName,
      arabic_subtitle: arabicSubtitle,
      phone,
      address,
      threshold: Number(threshold),
      oil_density: Number(oilDensity),
      default_milling_fee_per_kg: Number(defaultFeeRate),
      settings_json: {
        ...(settings.settings_json || {}),
        threshold: Number(threshold),
        oil_density: Number(oilDensity),
        default_milling_fee_per_kg: Number(defaultFeeRate)
      }
    };
    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Download ZIP Milestone Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileArchive className="w-6 h-6 text-amber-400" />
            <h3 className="font-bold text-base">Téléchargement du Projet Complet (Archive ZIP)</h3>
          </div>
          <p className="text-xs text-stone-300 mt-1 max-w-xl">
            Conforme à l'Étape 7 du cahier des charges : Téléchargez l'archive complète contenant le code source, les modules protégés de gestion de stock, les extensions de trituration/olives, le schéma Supabase et l'ensemble de la documentation de passation.
          </p>
        </div>

        <button
          onClick={onDownloadZip}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-lg shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Télécharger ZIP ERP</span>
        </button>
      </div>

      {/* Cloud & Supabase Sync Status Card */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-sm text-stone-900">Synchronisation Cloud Supabase</h3>
              <span className="text-xs text-stone-500">PostgreSQL Cloud DB & Base de données centrale</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
              isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
              {isOnline ? 'Connecté à Supabase' : 'Mode Cache Local'}
            </span>

            <button
              onClick={onSyncSupabase}
              className="p-2 hover:bg-stone-100 text-stone-600 hover:text-stone-900 rounded-lg border border-stone-200"
              title="Forcer la resynchronisation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-stone-500 block">Projet Supabase Connecté :</span>
            <span className="font-mono font-bold text-stone-900 block truncate">
              https://vtyytslihvjmyelhahum.supabase.co
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-stone-500 block">Tables synchronisées en direct :</span>
            <span className="font-mono font-bold text-stone-900">
              tanks, parties, operations, tank_movements, profiles, app_settings
            </span>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-stone-700" />
            <h3 className="font-bold text-sm text-stone-900">Paramètres de l'Entreprise & Règles Métier</h3>
          </div>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Enregistré avec succès !
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Nom Officiel de la Huilerie *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Sous-titre en Arabe *
              </label>
              <input
                type="text"
                dir="rtl"
                required
                value={arabicSubtitle}
                onChange={(e) => setArabicSubtitle(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-arabic font-bold text-amber-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Téléphone de Contact
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Adresse & Localité
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          {/* Technical Olives & Oil settings */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
              Constantes Physiques & Tarifs de Trituration
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Seuil d'Alerte Cuve (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max="98"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full p-2 pr-7 bg-white border border-stone-300 rounded font-mono font-bold"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Densité d'Huile par Défaut
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.900"
                  max="0.930"
                  value={oilDensity}
                  onChange={(e) => setOilDensity(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-stone-300 rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Tarif Trituration / KG (TND)
                </label>
                <input
                  type="number"
                  step="0.005"
                  min="0.01"
                  value={defaultFeeRate}
                  onChange={(e) => setDefaultFeeRate(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-stone-300 rounded font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {currentRole === 'admin' && (
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold flex items-center gap-2 shadow-2xs"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les Paramètres</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Audit Trail Section */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-700" />
          <h3 className="font-bold text-sm text-stone-900">Journal d'Audit & Traçabilité (Règle 7)</h3>
        </div>

        <div className="border border-stone-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-600 border-b border-stone-200 sticky top-0">
              <tr>
                <th className="p-2.5">Date & Heure</th>
                <th className="p-2.5">Utilisateur</th>
                <th className="p-2.5">Module</th>
                <th className="p-2.5">Action & Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50">
                    <td className="p-2.5 font-mono text-stone-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString('fr-TN')}
                    </td>
                    <td className="p-2.5 font-semibold text-stone-800">
                      {log.user}
                    </td>
                    <td className="p-2.5 text-stone-600">
                      {log.module}
                    </td>
                    <td className="p-2.5 text-stone-700">
                      <strong>{log.action}</strong>: {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-stone-400 italic">
                    Aucune action d'audit consignée pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
