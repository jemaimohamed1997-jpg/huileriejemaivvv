import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  History, 
  FileSpreadsheet, 
  HardDrive, 
  Cpu, 
  Monitor, 
  Settings as SettingsIcon, 
  LogOut, 
  PlusCircle, 
  MinusCircle, 
  ArrowLeftRight, 
  Save, 
  Menu, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  Droplet,
  Smartphone,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { UserSession, AppSettings } from '../types';

interface MobileNavigationProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  currentUser: UserSession;
  onLogout: () => void;
  onOpenEntree: () => void;
  onOpenSortie: () => void;
  onOpenTransfert: () => void;
  onOpenSettings: () => void;
  onQuickBackup: () => void;
  settings: AppSettings;
  cuvesCount: number;
  clientsCount: number;
  mouvementsCount: number;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  onOpenEntree,
  onOpenSortie,
  onOpenTransfert,
  onOpenSettings,
  onQuickBackup,
  settings,
  cuvesCount,
  clientsCount,
  mouvementsCount
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    setIsDrawerOpen(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard, badge: undefined },
    { id: 'cuves', label: 'Piles & Cuves', icon: Layers, badge: cuvesCount },
    { id: 'clients', label: 'Clients & Déposants', icon: Users, badge: clientsCount },
    { id: 'historique', label: 'Historique & Bons', icon: History, badge: mouvementsCount },
    { id: 'rapports', label: 'Rapports & Excel', icon: FileSpreadsheet, badge: undefined },
    { id: 'sauvegardes', label: 'Sauvegardes & Snapshots', icon: HardDrive, badge: undefined },
  ];

  return (
    <>
      {/* 1. Barre de navigation inférieure fixe pour smartphone (Sticky Bottom Bar) */}
      <nav 
        aria-label="Navigation mobile principale"
        className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900/98 backdrop-blur-md border-t border-stone-800 text-stone-300 md:hidden shadow-2xl safe-area-bottom"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          
          {/* Tab: Dashboard */}
          <button
            type="button"
            onClick={() => handleTabClick('dashboard')}
            className={`flex flex-col items-center justify-center h-full w-full py-1 transition cursor-pointer select-none active:scale-95 ${
              activeTab === 'dashboard' 
                ? 'text-emerald-400 font-bold' 
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'dashboard' ? 'bg-emerald-950/80' : ''}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Accueil</span>
          </button>

          {/* Tab: Cuves */}
          <button
            type="button"
            onClick={() => handleTabClick('cuves')}
            className={`flex flex-col items-center justify-center h-full w-full py-1 transition cursor-pointer select-none active:scale-95 relative ${
              activeTab === 'cuves' 
                ? 'text-emerald-400 font-bold' 
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'cuves' ? 'bg-emerald-950/80' : ''}`}>
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Cuves</span>
            {cuvesCount > 0 && (
              <span className="absolute top-1 right-2 text-[9px] bg-stone-700 text-stone-200 rounded-full px-1 font-mono">
                {cuvesCount}
              </span>
            )}
          </button>

          {/* Bouton Central Surélevé: Entrée Rapide (Primary Action) */}
          <div className="flex flex-col items-center justify-center -mt-5">
            <button
              type="button"
              onClick={onOpenEntree}
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-700 to-lime-600 text-white shadow-lg shadow-emerald-900/50 flex items-center justify-center border-3 border-stone-900 active:scale-90 transition cursor-pointer hover:from-emerald-600 hover:to-lime-500"
              title="Nouvelle Entrée d'Huile (Réception)"
            >
              <PlusCircle className="w-7 h-7" />
            </button>
            <span className="text-[10px] font-extrabold text-emerald-400 mt-0.5">Entrée</span>
          </div>

          {/* Bouton Sortie Rapide */}
          <button
            type="button"
            onClick={onOpenSortie}
            className="flex flex-col items-center justify-center h-full w-full py-1 text-amber-400 hover:text-amber-300 transition cursor-pointer select-none active:scale-95"
            title="Nouvelle Sortie d'Huile (Livraison)"
          >
            <div className="p-1 rounded-lg bg-amber-950/40">
              <MinusCircle className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] tracking-tight font-semibold mt-0.5">Sortie</span>
          </button>

          {/* Bouton Menu / Plus */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className={`flex flex-col items-center justify-center h-full w-full py-1 transition cursor-pointer select-none active:scale-95 ${
              isDrawerOpen 
                ? 'text-emerald-400 font-bold' 
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${isDrawerOpen ? 'bg-emerald-950/80' : ''}`}>
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Menu</span>
          </button>

        </div>
      </nav>

      {/* 2. Tiroir Latéral Plein Écran / Slide-out Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          
          {/* Backdrop sombre flouté */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-200" 
          />

          {/* Panneau de contenu latéral */}
          <div className="relative w-4/5 max-w-sm h-full bg-stone-900 text-stone-100 shadow-2xl flex flex-col z-10 border-l border-stone-800 animate-in slide-in-from-right duration-200">
            
            {/* Header du Drawer avec identité et profil */}
            <div className="p-4 border-b border-stone-800 bg-stone-950/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center text-amber-400">
                    <Droplet className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white leading-tight">
                      {settings.nomEntreprise}
                    </h3>
                    <p className="text-[11px] font-bold text-amber-400 font-serif" dir="rtl">
                      {settings.sousTitreArabe}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Badge Utilisateur connecté */}
              <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Connecté en tant que</span>
                  <span className="text-xs font-bold text-stone-200">{currentUser.nomAffiche}</span>
                </div>
                <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-950/80 text-purple-200 border-purple-700'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            {/* Actions Rapides en Boutons Touch */}
            <div className="p-3 bg-stone-950/30 border-b border-stone-800 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { onOpenTransfert(); setIsDrawerOpen(false); }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-sky-950/60 border border-sky-800 text-sky-200 text-xs font-bold active:scale-95 transition cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4 text-sky-400" />
                <span>Transfert</span>
              </button>

              <button
                type="button"
                onClick={() => { onQuickBackup(); setIsDrawerOpen(false); }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 text-xs font-semibold active:scale-95 transition cursor-pointer"
              >
                <Save className="w-4 h-4 text-stone-400" />
                <span>Sauvegarde</span>
              </button>
            </div>

            {/* Liste de Navigation */}
            <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
              <div className="text-[10px] uppercase font-bold text-stone-500 px-3 py-1 tracking-wider">
                Modules de l'Huilerie
              </div>

              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-98 ${
                      isActive 
                        ? 'bg-emerald-800 text-white shadow-sm' 
                        : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {item.badge !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          isActive ? 'bg-emerald-950 text-emerald-200' : 'bg-stone-800 text-stone-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                    </div>
                  </button>
                );
              })}

              <div className="pt-3 border-t border-stone-800/80 my-2"></div>

              {/* Paramètres de l'huilerie */}
              <button
                type="button"
                onClick={() => { onOpenSettings(); setIsDrawerOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-300 hover:bg-stone-800 transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <SettingsIcon className="w-4 h-4 text-stone-400" />
                  <span>Paramètres & Tarifs</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
              </button>
            </div>

            {/* Pied du Drawer: Déconnexion */}
            <div className="p-3 border-t border-stone-800 bg-stone-950/80">
              <button
                type="button"
                onClick={() => { setIsDrawerOpen(false); onLogout(); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 hover:bg-red-900 text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Se déconnecter</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
