import React from 'react';
import { Database, Globe, UserCheck, Shield, ChevronDown, Droplet, Download } from 'lucide-react';
import { AppSettings, UserProfile } from '../types/stock';
import { Language, translations } from '../lib/i18n';

interface NavbarProps {
  settings: AppSettings;
  profiles: UserProfile[];
  currentProfile: UserProfile;
  lang: Language;
  isOnline: boolean;
  onToggleLanguage: () => void;
  onSwitchProfile: (profile: UserProfile) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  profiles,
  currentProfile,
  lang,
  isOnline,
  onToggleLanguage,
  onSwitchProfile
}) => {
  const t = translations[lang];

  return (
    <header className="no-print bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 font-black shadow-xs">
          <Droplet className="w-5 h-5 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base tracking-tight text-white">
              {settings.company_name}
            </h1>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-bold">
              ERP v2.4
            </span>
          </div>
          <p className="text-xs font-arabic text-amber-300 font-bold" dir="rtl">
            {settings.arabic_subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick ZIP Download button */}
        <a
          href="/huilerie-jemai-erp-latest.zip"
          download="huilerie-jemai-erp-latest.zip"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm border border-emerald-500/50 transition active:scale-95"
          title="Télécharger l'archive ZIP complète du projet prête pour déploiement Vercel"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'تحميل المشروع ZIP' : 'Télécharger Projet ZIP'}</span>
        </a>

        {/* Supabase status indicator */}
        <div
          title={isOnline ? 'Base de données Supabase connectée en direct' : 'Mode local hors-ligne'}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-stone-800/80 rounded-lg border border-stone-700/80 text-xs"
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-stone-300 text-[11px] font-medium font-mono">
            {isOnline ? 'Supabase Sync' : 'Hors-Ligne'}
          </span>
        </div>

        {/* Language Switcher */}
        <button
          onClick={onToggleLanguage}
          className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-colors"
          title="Changer de langue / تغيير اللغة"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{lang === 'fr' ? 'العربية' : 'Français'}</span>
        </button>

        {/* Role & Profile Switcher */}
        <div className="relative group">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-800 hover:bg-stone-700/80 border border-stone-700 rounded-lg text-xs cursor-pointer transition-colors">
            {currentProfile.role === 'admin' ? (
              <Shield className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <div className="text-left hidden sm:block">
              <span className="font-bold text-stone-200 block text-[11px] leading-tight">
                {currentProfile.display_name}
              </span>
              <span className="text-[10px] text-stone-400 capitalize">
                {currentProfile.role === 'admin' ? 'Administrateur' : 'Opérateur'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-stone-400 ml-0.5" />
          </div>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-1.5 w-56 bg-stone-900 border border-stone-700 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
            <div className="p-2 border-b border-stone-800 text-[11px] text-stone-400 font-semibold">
              Changer de Profil Utilisateur
            </div>
            <div className="p-1 space-y-0.5">
              {profiles.map(p => (
                <button
                  key={p.id}
                  onClick={() => onSwitchProfile(p)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    p.id === currentProfile.id
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <div>
                    <span className="block">{p.display_name}</span>
                    <span className="text-[10px] text-stone-400 capitalize">{p.role}</span>
                  </div>
                  {p.id === currentProfile.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
