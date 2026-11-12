/**
 * Huilerie Jemai (معصرة جماعي) - Types et Modèles de Données
 */

export type MovementType = 'ENTREE' | 'SORTIE' | 'TRANSFERT_SORTIE' | 'TRANSFERT_ENTREE' | 'ANNULATION';

export interface Cuve {
  id: string;
  numero: string;          // Ex: P-01, CUVE-10
  nom: string;             // Ex: "Pile Inox Nord 5000L"
  capaciteMax: number;     // En Litres
  active: boolean;
  dateCreation: string;
  notes?: string;
}

export interface Client {
  id: string;
  codeClient: string;      // Ex: CLI-001
  nomComplet: string;      // Nom ou Raison Sociale
  telephone?: string;
  notes?: string;
  dateCreation: string;
  actif?: boolean;         // Statut actif ou archivé/désactivé
}

export interface Movement {
  id: string;
  numeroBon: string;       // Ex: BON-REC-2026-0001
  typeMouvement: MovementType;
  cuveId: string;
  clientId: string;
  quantite: number;        // En Litres (> 0)
  acidite?: number;        // Degré d'acidité (°), ex: 0.4
  dateMouvement: string;   // ISO format YYYY-MM-DDTHH:mm:ss
  dateCorrigee?: boolean;
  dateCorrectionAudit?: string;
  motif?: string;
  observations?: string;
  utilisateur: string;     // Ex: "Opérateur Cuverie" ou "Admin"
  mouvementOrigineId?: string; // Pour les transferts ou annulations liées
  estAnnule: boolean;
  dateAnnulation?: string;
  motifAnnulation?: string;
  utilisateurAnnulation?: string;
}

export interface AuditLog {
  id: string;
  dateAction: string;
  utilisateur: string;
  action: string;
  tableCible: string;
  entiteId?: string;
  details: string;
}

export interface AppSettings {
  nomEntreprise: string;
  sousTitreArabe: string;
  precisionDecimales: number; // 0, 1 ou 2
  unite: string;              // 'L'
  contactTelephone: string;
  adresse: string;
  alertSeuilRemplissage: number; // % (ex: 85)
}

export interface UserPermissions {
  peutEntrerHuile: boolean;
  peutSortirHuile: boolean;
  peutTransferer: boolean;
  peutAnnuler: boolean;
  peutGererCuves: boolean;
  peutGererClients: boolean;
  peutVoirRapports: boolean;
  peutGererParametres: boolean;
}

export interface UserAccount {
  id: string;
  username: string; // ex: "wizz"
  password: string; // ex: "wizz"
  nomAffiche: string;
  role: 'admin' | 'operateur';
  actif: boolean;
  telephone?: string;
  dateCreation: string;
  acces: UserPermissions;
}

export interface UserSession {
  username: string;
  role: 'admin' | 'operateur' | 'client';
  nomAffiche: string;
  clientId?: string;
  telephone?: string;
  email?: string;
  dernierAcces?: string;
  acces?: UserPermissions;
}

export interface CuveDetails extends Cuve {
  stockActuel: number;
  capaciteRestante: number;
  tauxRemplissage: number;
  clients: {
    client: Client;
    quantite: number;
    pourcentage: number;
  }[];
}

export interface ClientBalance {
  client: Client;
  totalStock: number;
  parCuve: {
    cuve: Cuve;
    quantite: number;
  }[];
  derniersMouvements: Movement[];
}

export interface BackupSnapshot {
  id: string;
  date: string;
  nomFichier: string;
  tailleKo: number;
  nbMouvements: number;
  nbCuves: number;
  nbClients: number;
  donneesJSON: string;
  description: string;
}

export interface TestResultItem {
  id: number;
  titre: string;
  description: string;
  statut: 'en_attente' | 'en_cours' | 'succes' | 'echec';
  message?: string;
  tempsMs?: number;
  detailsLog?: string[];
}
