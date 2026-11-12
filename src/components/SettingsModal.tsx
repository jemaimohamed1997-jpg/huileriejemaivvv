import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  X, 
  Save, 
  CheckCircle2, 
  Building, 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Key, 
  Trash2, 
  Edit3, 
  Lock, 
  Eye, 
  EyeOff,
  Check,
  AlertTriangle,
  UserCheck,
  Cloud,
  Database,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { AppSettings, UserAccount, UserPermissions } from '../types';
import { dbService } from '../services/db';
import { checkSupabaseConnection, SUPABASE_URL, SUPABASE_ANON_KEY } from '../services/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const DEFAULT_PERMISSIONS_ADMIN: UserPermissions = {
  peutEntrerHuile: true,
  peutSortirHuile: true,
  peutTransferer: true,
  peutAnnuler: true,
  peutGererCuves: true,
  peutGererClients: true,
  peutVoirRapports: true,
  peutGererParametres: true
};

const DEFAULT_PERMISSIONS_OPERATEUR: UserPermissions = {
  peutEntrerHuile: true,
  peutSortirHuile: true,
  peutTransferer: true,
  peutAnnuler: false,
  peutGererCuves: false,
  peutGererClients: true,
  peutVoirRapports: true,
  peutGererParametres: false
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'supabase'>('general');

  // État Supabase
  const [supabaseStatus, setSupabaseStatus] = useState<{
    checking: boolean;
    connected: boolean;
    canWrite: boolean;
    url: string;
    keySnippet: string;
    lastSync?: string;
    error?: string;
  }>({
    checking: false,
    connected: true,
    canWrite: false,
    url: SUPABASE_URL,
    keySnippet: SUPABASE_ANON_KEY.substring(0, 16) + '...',
  });

  // Formulaire Général
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [success, setSuccess] = useState(false);
  const [userSuccess, setUserSuccess] = useState('');
  const [userError, setUserError] = useState('');

  // Liste des utilisateurs
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Formulaire Nouvel Utilisateur / Édition
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nomAfficheInput, setNomAfficheInput] = useState('');
  const [roleInput, setRoleInput] = useState<'admin' | 'operateur'>('operateur');
  const [telephoneInput, setTelephoneInput] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [permissionsInput, setPermissionsInput] = useState<UserPermissions>({ ...DEFAULT_PERMISSIONS_OPERATEUR });

  const testSupabase = async () => {
    setSupabaseStatus(prev => ({ ...prev, checking: true, error: undefined }));
    try {
      const res = await checkSupabaseConnection();
      setSupabaseStatus({
        checking: false,
        connected: res.connected,
        canWrite: res.canWrite,
        url: SUPABASE_URL,
        keySnippet: SUPABASE_ANON_KEY.substring(0, 16) + '...',
        lastSync: new Date().toLocaleTimeString('fr-FR'),
        error: res.rlsWarning || res.error
      });
    } catch (err: any) {
      setSupabaseStatus(prev => ({
        ...prev,
        checking: false,
        connected: false,
        canWrite: false,
        error: err.message
      }));
    }
  };

  const refreshUsers = () => {
    setUsersList(dbService.getUsers());
  };

  useEffect(() => {
    if (isOpen) {
      refreshUsers();
      setFormData({ ...settings });
      testSupabase();
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 800);
  };

  const openAddUser = () => {
    setEditingUser(null);
    setUsernameInput('');
    setPasswordInput('');
    setNomAfficheInput('');
    setRoleInput('operateur');
    setTelephoneInput('');
    setPermissionsInput({ ...DEFAULT_PERMISSIONS_OPERATEUR });
    setUserError('');
    setShowAddUserModal(true);
  };

  const openEditUser = (user: UserAccount) => {
    setEditingUser(user);
    setUsernameInput(user.username);
    setPasswordInput(user.password);
    setNomAfficheInput(user.nomAffiche);
    setRoleInput(user.role);
    setTelephoneInput(user.telephone || '');
    setPermissionsInput({ ...user.acces });
    setUserError('');
    setShowAddUserModal(true);
  };

  const handleRoleChange = (newRole: 'admin' | 'operateur') => {
    setRoleInput(newRole);
    if (newRole === 'admin') {
      setPermissionsInput({ ...DEFAULT_PERMISSIONS_ADMIN });
    } else {
      setPermissionsInput({ ...DEFAULT_PERMISSIONS_OPERATEUR });
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    try {
      if (editingUser) {
        dbService.modifierUtilisateur(editingUser.id, {
          username: usernameInput,
          password: passwordInput,
          nomAffiche: nomAfficheInput,
          role: roleInput,
          telephone: telephoneInput,
          acces: permissionsInput
        });
        setUserSuccess(`Utilisateur '${usernameInput}' modifié avec succès !`);
      } else {
        dbService.ajouterUtilisateur({
          username: usernameInput,
          password: passwordInput,
          nomAffiche: nomAfficheInput || usernameInput,
          role: roleInput,
          actif: true,
          telephone: telephoneInput,
          acces: permissionsInput
        });
        setUserSuccess(`Utilisateur '${usernameInput}' créé avec succès !`);
      }
      refreshUsers();
      setShowAddUserModal(false);
      setTimeout(() => setUserSuccess(''), 3000);
    } catch (err: any) {
      setUserError(err.message || "Erreur lors de l'enregistrement de l'utilisateur");
    }
  };

  const handleDeleteUser = (user: UserAccount) => {
    if (window.confirm(`Confirmez-vous la suppression du compte '${user.username}' (${user.nomAffiche}) ?`)) {
      try {
        dbService.supprimerUtilisateur(user.id);
        refreshUsers();
        setUserSuccess(`Utilisateur '${user.username}' supprimé avec succès.`);
        setTimeout(() => setUserSuccess(''), 3000);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleToggleUserActif = (user: UserAccount) => {
    try {
      dbService.modifierUtilisateur(user.id, { actif: !user.actif });
      refreshUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 my-auto max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header Modal */}
        <div className="flex justify-between items-start pb-3 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900">
                Paramètres & Gestion des Accès
              </h3>
              <p className="text-xs text-stone-500">
                Coordonnées de l'huilerie, utilisateurs, mots de passe et droits
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-stone-200 mt-4 mb-4 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'general'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Coordonnées & Cuverie</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'users'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Utilisateurs & Mots de Passe ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'supabase'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cloud Supabase</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          </button>
        </div>

        {/* Message d'état */}
        {userSuccess && (
          <div className="mb-3 p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2 border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{userSuccess}</span>
          </div>
        )}

        {/* Corps des onglets */}
        <div className="overflow-y-auto flex-1 pr-1">
          
          {/* 1. ONGLET GÉNÉRAL */}
          {activeTab === 'general' && (
            <form onSubmit={handleGeneralSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nom de l'Huilerie (Français)
                </label>
                <input
                  type="text"
                  required
                  value={formData.nomEntreprise}
                  onChange={(e) => setFormData({ ...formData, nomEntreprise: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Sous-titre / En-tête (Arabe)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={formData.sousTitreArabe}
                  onChange={(e) => setFormData({ ...formData, sousTitreArabe: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-serif focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Précision des Litres (Décimales)
                  </label>
                  <select
                    value={formData.precisionDecimales}
                    onChange={(e) => setFormData({ ...formData, precisionDecimales: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="0">0 décimale (ex: 3 000 L)</option>
                    <option value="1">1 décimale (ex: 3 000.5 L)</option>
                    <option value="2">2 décimales (ex: 3 000.25 L)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Seuil d'Alerte Cuve Pleine (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="99"
                    value={formData.alertSeuilRemplissage}
                    onChange={(e) => setFormData({ ...formData, alertSeuilRemplissage: parseInt(e.target.value, 10) || 85 })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Téléphone de Contact
                </label>
                <input
                  type="text"
                  value={formData.contactTelephone}
                  onChange={(e) => setFormData({ ...formData, contactTelephone: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Adresse physique de l'huilerie
                </label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-stone-300 rounded-lg font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer Coordonnées</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. ONGLET UTILISATEURS, MOTS DE PASSE & DROITS D'ACCÈS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <p className="text-xs text-stone-500">
                  Gérez les identifiants, mots de passe de connexion et permissions pour chaque poste de pesée ou de gérance.
                </p>
                <button
                  type="button"
                  onClick={openAddUser}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Ajouter un Utilisateur</span>
                </button>
              </div>

              {/* Liste des comptes utilisateurs */}
              <div className="space-y-2.5">
                {usersList.map((user) => {
                  const isMasterAdmin = user.username.toLowerCase() === 'wizz';

                  return (
                    <div
                      key={user.id}
                      className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 hover:border-stone-300 transition flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}>
                          {user.role === 'admin' ? '👑' : '⚖️'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-stone-900 text-sm">
                              {user.username}
                            </span>
                            {isMasterAdmin && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                                Compte Principal
                              </span>
                            )}
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {user.role === 'admin' ? 'Administrateur' : 'Opérateur Cuverie'}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              user.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {user.actif ? 'Actif' : 'Désactivé'}
                            </span>
                          </div>

                          <div className="text-stone-600 font-medium mt-0.5">
                            {user.nomAffiche} {user.telephone && `&bull; ${user.telephone}`}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1 font-mono">
                            <span>Mot de passe :</span>
                            <span className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-800 font-bold">
                              {user.password}
                            </span>
                          </div>

                          {/* Permissions summary */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {user.acces?.peutEntrerHuile && <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 rounded">Entrées</span>}
                            {user.acces?.peutSortirHuile && <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 rounded">Sorties</span>}
                            {user.acces?.peutTransferer && <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 rounded">Transferts</span>}
                            {user.acces?.peutAnnuler && <span className="text-[10px] bg-red-100 text-red-800 px-1.5 rounded">Annulations</span>}
                            {user.acces?.peutGererCuves && <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 rounded">Cuves</span>}
                            {user.acces?.peutGererParametres && <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 rounded">Paramètres</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditUser(user)}
                          className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-stone-200/80 rounded-lg cursor-pointer transition flex items-center gap-1"
                          title="Modifier identifiant, mot de passe ou accès"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">Modifier</span>
                        </button>

                        {!isMasterAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg cursor-pointer transition"
                            title="Supprimer cet utilisateur"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. ONGLET SUPABASE CLOUD DATABASE */}
          {activeTab === 'supabase' && (
            <div className="space-y-4 text-xs">
              {/* Carte de statut principale */}
              <div className="p-4 rounded-xl border bg-gradient-to-br from-emerald-50 via-stone-50 to-amber-50 border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                        Connexion Supabase Cloud
                        {supabaseStatus.canWrite ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Lecture & Écriture Actives
                          </span>
                        ) : supabaseStatus.connected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Connecté (RLS Restreint en Écriture)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                            <X className="w-3 h-3 text-red-600" />
                            Non connecté
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Base de données PostgreSQL distante ({supabaseStatus.url})
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={testSupabase}
                    disabled={supabaseStatus.checking}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${supabaseStatus.checking ? 'animate-spin' : ''}`} />
                    <span>{supabaseStatus.checking ? 'Test en cours...' : 'Tester la Connexion'}</span>
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-emerald-200/60 font-mono text-[11px]">
                  <div className="bg-white/80 p-2.5 rounded-lg border border-stone-200">
                    <span className="text-stone-500 font-sans block text-[10px] uppercase font-bold tracking-wider">
                      Supabase Project URL
                    </span>
                    <span className="text-emerald-950 font-bold truncate block select-all">
                      {supabaseStatus.url}
                    </span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-stone-200">
                    <span className="text-stone-500 font-sans block text-[10px] uppercase font-bold tracking-wider">
                      Clé Publique (Publishable Key)
                    </span>
                    <span className="text-stone-800 font-bold truncate block select-all">
                      {supabaseStatus.keySnippet}
                    </span>
                  </div>
                </div>

                {supabaseStatus.error && (
                  <div className="mt-3 p-2.5 bg-red-50 text-red-800 rounded-lg text-[11px] border border-red-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{supabaseStatus.error}</span>
                  </div>
                )}

                {supabaseStatus.lastSync && (
                  <p className="text-[11px] text-stone-500 mt-2.5 flex items-center gap-1 font-mono">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Dernière vérification à : {supabaseStatus.lastSync}
                  </p>
                )}
              </div>

              {/* Guide de Déblocage RLS pour Supabase */}
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Politiques de Sécurité RLS recommandées pour vos tables Supabase :</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Pour maintenir <strong>Row Level Security (RLS) activé</strong> sur vos tables tout en autorisant les mouvements, clients et cuves de l'Huilerie Jemai, copiez et exécutez ce script dans votre <strong>Supabase Dashboard &gt; SQL Editor</strong> :
                </p>
                <div className="bg-stone-900 text-amber-300 p-2.5 rounded-lg font-mono text-[10px] select-all overflow-x-auto leading-relaxed max-h-48 overflow-y-auto">
{`-- 1. Table des Clients (avec code_client UNIQUE)
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    code_client TEXT UNIQUE NOT NULL,
    nom_complet TEXT NOT NULL,
    telephone TEXT,
    notes TEXT,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acces clients" ON public.clients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 2. Table des Cuves / Piles Inox
CREATE TABLE IF NOT EXISTS public.cuves (
    id TEXT PRIMARY KEY,
    numero TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    capacite_max NUMERIC NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    date_creation TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.cuves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acces cuves" ON public.cuves FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 3. Table des Mouvements (Entrées, Sorties, Transferts avec N° Bon UNIQUE)
CREATE TABLE IF NOT EXISTS public.movements (
    id TEXT PRIMARY KEY,
    numero_bon TEXT NOT NULL,
    type_mouvement TEXT NOT NULL,
    cuve_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    quantite NUMERIC NOT NULL,
    acidite NUMERIC,
    date_mouvement TIMESTAMPTZ DEFAULT NOW(),
    motif TEXT,
    observations TEXT,
    utilisateur TEXT NOT NULL,
    est_annule BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT movements_numero_bon_key UNIQUE (numero_bon)
);
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acces movements" ON public.movements FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Table des Séquences Atomiques & Fonction PostgreSQL Anti-Collision (Résolution 23505)
CREATE TABLE IF NOT EXISTS public.bon_sequences (
    type_bon TEXT NOT NULL,
    annee INT NOT NULL,
    dernier_numero INT NOT NULL DEFAULT 0,
    PRIMARY KEY (type_bon, annee)
);
ALTER TABLE public.bon_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acces bon_sequences" ON public.bon_sequences FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Fonction atomique garantissant zéro collision même pour des opérateurs simultanés
CREATE OR REPLACE FUNCTION public.get_next_bon_number(p_type TEXT, p_year INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_next_val INT;
    v_max_existing INT;
    v_prefix TEXT;
BEGIN
    v_prefix := 'BON-' || UPPER(p_type) || '-' || p_year || '-';

    -- Déterminer le plus grand numéro existant dans movements
    SELECT COALESCE(MAX(
        NULLIF(SUBSTRING(numero_bon FROM 'BON-[A-Z]+-[0-9]+-([0-9]+)$'), '')::INT
    ), 0)
    INTO v_max_existing
    FROM public.movements
    WHERE numero_bon LIKE v_prefix || '%';

    -- Incrémentation atomique avec verrouillage de ligne
    INSERT INTO public.bon_sequences (type_bon, annee, dernier_numero)
    VALUES (UPPER(p_type), p_year, GREATEST(v_max_existing, 0) + 1)
    ON CONFLICT (type_bon, annee) DO UPDATE
    SET dernier_numero = GREATEST(bon_sequences.dernier_numero, v_max_existing) + 1
    RETURNING dernier_numero INTO v_next_val;

    RETURN v_prefix || LPAD(v_next_val::TEXT, 4, '0');
END;
$$;

-- 5. Publication Realtime pour synchronisation instantanée multi-appareils
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cuves;
ALTER PUBLICATION supabase_realtime ADD TABLE public.movements;`}
                </div>
                <p className="text-[10px] text-amber-800 italic">
                  Ce script configure les tables avec contraintes d'unicité, RLS activé et publication Realtime sans exposer aucune clé secrète.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-stone-300 rounded-lg font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* SOUS-MODAL : AJOUT / MODIFICATION D'UN UTILISATEUR & PERMISSIONS */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-300 max-h-[92vh] overflow-y-auto">
            
            <div className="flex justify-between items-start pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-700" />
                <h4 className="text-sm font-bold text-stone-900">
                  {editingUser ? `Modifier l'utilisateur '${editingUser.username}'` : "Créer un Nouvel Utilisateur"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {userError && (
              <div className="mt-3 p-2.5 bg-red-50 text-red-800 rounded-lg text-xs font-bold border border-red-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{userError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Identifiant de Connexion (User) *
                  </label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="ex: wizz, operateur2, pesee..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Mot de Passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showUserPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Mot de passe secret"
                      className="w-full pl-3 pr-8 py-2 border border-stone-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUserPassword(!showUserPassword)}
                      className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600"
                    >
                      {showUserPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Nom Complet / Affiché
                  </label>
                  <input
                    type="text"
                    value={nomAfficheInput}
                    onChange={(e) => setNomAfficheInput(e.target.value)}
                    placeholder="ex: Mohamed Jemai, Ali (Pesée)"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Rôle de l'Utilisateur *
                  </label>
                  <select
                    value={roleInput}
                    onChange={(e) => handleRoleChange(e.target.value as 'admin' | 'operateur')}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="admin">Administrateur / Gérant (Tous les droits)</option>
                    <option value="operateur">Opérateur de Cuverie / Pesée</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Téléphone (Facultatif)
                </label>
                <input
                  type="text"
                  value={telephoneInput}
                  onChange={(e) => setTelephoneInput(e.target.value)}
                  placeholder="ex: +216 98 000 000"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              {/* Permissions & Droits d'Accès détaillés */}
              <div className="pt-2 border-t border-stone-200">
                <label className="block font-bold text-stone-800 mb-2">
                  Droits d'Accès & Permissions Détaillées :
                </label>

                <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissionsInput.peutEntrerHuile}
                      onChange={(e) => setPermissionsInput({ ...permissionsInput, peutEntrerHuile: e.target.checked })}
                      className="rounded text-emerald-700 focus:ring-0"
                    />
                    <span>Peut enregistrer des Entrées</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissionsInput.peutSortirHuile}
                      onChange={(e) => setPermissionsInput({ ...permissionsInput, peutSortirHuile: e.target.checked })}
                      className="rounded text-emerald-700 focus:ring-0"
                    />
                    <span>Peut enregistrer des Sorties</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissionsInput.peutTransferer}
                      onChange={(e) => setPermissionsInput({ ...permissionsInput, peutTransferer: e.target.checked })}
                      className="rounded text-emerald-700 focus:ring-0"
                    />
                    <span>Peut faire des Transferts</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissionsInput.peutAnnuler}
                      onChange={(e) => setPermissionsInput({ ...permissionsInput, peutAnnuler: e.target.checked })}
                      className="rounded text-red-600 focus:ring-0"
                    />
                    <span className="font-semibold text-red-900">Peut Annuler des Bons</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissionsInput.peutGererCuves}
                      onChange={(e) => setPermissionsInput({ ...permissionsInput, peutGererCuves: e.target.checked })}
                      className="rounded text-emerald-700 focus:ring-0"
                    />
                    <span>Peut Créer/Gérer Cuves</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissionsInput.peutGererClients}
                      onChange={(e) => setPermissionsInput({ ...permissionsInput, peutGererClients: e.target.checked })}
                      className="rounded text-emerald-700 focus:ring-0"
                    />
                    <span>Peut Gérer Déposants</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissionsInput.peutVoirRapports}
                      onChange={(e) => setPermissionsInput({ ...permissionsInput, peutVoirRapports: e.target.checked })}
                      className="rounded text-emerald-700 focus:ring-0"
                    />
                    <span>Peut Voir/Exporter Rapports</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissionsInput.peutGererParametres}
                      onChange={(e) => setPermissionsInput({ ...permissionsInput, peutGererParametres: e.target.checked })}
                      className="rounded text-purple-700 focus:ring-0"
                    />
                    <span className="font-semibold text-purple-900">Accès aux Paramètres</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer l'Utilisateur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
