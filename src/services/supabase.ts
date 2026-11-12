/**
 * Client Supabase officiel pour Huilerie Jemai (معصرة جماعي)
 * Connecté au projet Cloud Supabase avec persistance et fallback transparent.
 */

import { createClient } from '@supabase/supabase-js';

// Helper de résolution sûre des variables d'environnement (Vite browser + Node.js/tsx/Vercel)
const getEnv = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key]!;
    }
  } catch {}
  return fallback;
};

// URL du projet (nettoyée pour retirer le suffixe /rest/v1/ si fourni)
const rawUrl = getEnv('VITE_SUPABASE_URL', 'https://vtyytslihvjmyelhahum.supabase.co').trim();
export const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '');

// Clé publique d'API fournie
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_LXJ1R8X0W01sc44edNemwA_pjCRXt6j').trim();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseHealth {
  connected: boolean;
  canRead: boolean;
  canWrite: boolean;
  url: string;
  lastChecked: string;
  error?: string;
  rlsWarning?: string;
}

export function ensureUuid(id: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const nowHex = Date.now().toString(16).padStart(12, '0');
  return `${hex.slice(0, 8)}-1234-4567-89ab-${nowHex.slice(-12)}`;
}

export async function checkSupabaseConnection(): Promise<SupabaseHealth> {
  let canRead = false;
  let canWrite = false;
  let readError: string | undefined;
  let rlsWarning: string | undefined;

  // 1. Test lecture
  try {
    const { data, error } = await supabase.from('movements').select('id').limit(1);
    if (!error) {
      canRead = true;
    } else {
      readError = error.message;
    }
  } catch (err: any) {
    readError = err.message;
  }

  // 2. Test écriture (pour vérifier les politiques RLS)
  try {
    const testId = ensureUuid(`test-${Date.now()}`);
    // Essai 1 : Schéma standard
    const testRow1 = {
      id: testId,
      type_mouvement: 'ENTREE',
      quantite: 0.1,
      cuve_id: 'TEST_CHECK',
      client_id: 'CLI_CHECK',
      observations: 'Vérification de connexion Huilerie Jemai',
      motif: 'TEST_CONNEXION',
      date_mouvement: new Date().toISOString(),
      utilisateur: 'SYSTEME',
      est_annule: false
    };
    const { error: writeErr1 } = await supabase.from('movements').insert([testRow1]);
    if (!writeErr1) {
      canWrite = true;
      await supabase.from('movements').delete().eq('id', testId);
    } else if (writeErr1.code === 'PGRST204' || writeErr1.code === '22P02') {
      // Essai 2 : Schéma alternatif
      const testRow2 = {
        id: testId,
        type: 'ENTREE',
        quantity: 0.1,
        lot: 'TEST_CHECK',
        reason: 'TEST_CONNEXION',
        note: 'Vérification de connexion Huilerie Jemai',
        created_at: new Date().toISOString()
      };
      const { error: writeErr2 } = await supabase.from('movements').insert([testRow2]);
      if (!writeErr2) {
        canWrite = true;
        await supabase.from('movements').delete().eq('id', testId);
      } else if (writeErr2.code === '42501' || writeErr2.message?.includes('row-level security')) {
        rlsWarning = "RLS active : la table 'movements' requiert une policy d'insertion (INSERT) pour le rôle anon.";
      } else {
        rlsWarning = `Erreur insertion : ${writeErr2.message}`;
      }
    } else if (writeErr1.code === '42501' || writeErr1.message?.includes('row-level security')) {
      rlsWarning = "RLS active : la table 'movements' requiert une policy d'insertion (INSERT) pour le rôle anon.";
    } else {
      rlsWarning = `Erreur insertion : ${writeErr1.message}`;
    }
  } catch (err: any) {
    rlsWarning = err.message;
  }

  return {
    connected: canRead,
    canRead,
    canWrite,
    url: SUPABASE_URL,
    lastChecked: new Date().toISOString(),
    error: readError,
    rlsWarning
  };
}

/**
 * Tente d'envoyer un mouvement unique directement à Supabase et renvoie le diagnostic précis
 */
export async function pushMovementToSupabase(m: {
  id: string;
  typeMouvement: string;
  quantite: number;
  cuveId: string;
  clientId: string;
  numeroBon: string;
  motif?: string;
  observations?: string;
  utilisateur?: string;
  dateMouvement?: string;
  acidite?: number;
}): Promise<{ success: boolean; error?: string; errorCode?: string }> {
  try {
    const safeUuid = ensureUuid(m.id);
    const primaryPayload = {
      id: safeUuid,
      numero_bon: m.numeroBon,
      type_mouvement: m.typeMouvement,
      cuve_id: m.cuveId,
      client_id: m.clientId,
      quantite: m.quantite,
      acidite: m.acidite || null,
      date_mouvement: m.dateMouvement || new Date().toISOString(),
      motif: m.motif || null,
      observations: m.observations || null,
      utilisateur: m.utilisateur || 'Personnel Huilerie'
    };

    const { error: err1 } = await supabase.from('movements').upsert([primaryPayload], { onConflict: 'id' });
    if (!err1) {
      return { success: true };
    }

    // Si les colonnes type_mouvement ou cuve_id n'existent pas encore dans Supabase, repli sur le schéma secondaire
    if (err1.code === 'PGRST204' || err1.code === '22P02') {
      const altPayload = {
        id: safeUuid,
        type: m.typeMouvement,
        quantity: m.quantite,
        lot: m.cuveId,
        reason: m.motif || m.numeroBon || 'Mouvement Huile',
        note: [m.observations, m.numeroBon ? `Bon: ${m.numeroBon}` : '', m.clientId ? `Client: ${m.clientId}` : ''].filter(Boolean).join(' | '),
        created_at: m.dateMouvement || new Date().toISOString()
      };
      const { error: err2 } = await supabase.from('movements').upsert([altPayload], { onConflict: 'id' });
      if (!err2) {
        return { success: true };
      }
      return { success: false, error: `${err2.code}: ${err2.message}`, errorCode: err2.code };
    }

    return { success: false, error: `${err1.code}: ${err1.message}`, errorCode: err1.code };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur inconnue' };
  }
}

/**
 * Récupère l'intégralité des données en direct depuis Supabase
 */
export async function fetchAllSupabaseData(): Promise<{
  cuves: any[];
  clients: any[];
  movements: any[];
  settings: any | null;
  error?: string;
}> {
  try {
    const [cRes, clRes, mRes, sRes] = await Promise.allSettled([
      supabase.from('cuves').select('*'),
      supabase.from('clients').select('*'),
      supabase.from('movements').select('*'),
      supabase.from('settings').select('*').limit(1).maybeSingle()
    ]);

    const cuves = cRes.status === 'fulfilled' && !cRes.value.error && cRes.value.data ? cRes.value.data : [];
    const clients = clRes.status === 'fulfilled' && !clRes.value.error && clRes.value.data ? clRes.value.data : [];
    let movements = mRes.status === 'fulfilled' && !mRes.value.error && mRes.value.data ? mRes.value.data : [];
    const settings = sRes.status === 'fulfilled' && !sRes.value.error && sRes.value.data ? sRes.value.data : null;

    // Trier les mouvements par date décroissante en toute sécurité
    movements.sort((a: any, b: any) => {
      const dateA = new Date(a.date_mouvement || a.created_at || 0).getTime();
      const dateB = new Date(b.date_mouvement || b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return { cuves, clients, movements, settings };
  } catch (err: any) {
    return { cuves: [], clients: [], movements: [], settings: null, error: err.message };
  }
}

/**
 * Initialise le canal Supabase Realtime pour la synchronisation automatique multi-appareils
 */
export function initSupabaseRealtime(
  onDataChange: (payload: { table: string; eventType: string; newRow: any; oldRow: any }) => void
): () => void {
  try {
    const channel = supabase
      .channel('huilerie_jemai_realtime_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cuves' }, (payload) => {
        onDataChange({ table: 'cuves', eventType: payload.eventType, newRow: payload.new, oldRow: payload.old });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, (payload) => {
        onDataChange({ table: 'clients', eventType: payload.eventType, newRow: payload.new, oldRow: payload.old });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movements' }, (payload) => {
        onDataChange({ table: 'movements', eventType: payload.eventType, newRow: payload.new, oldRow: payload.old });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
        onDataChange({ table: 'settings', eventType: payload.eventType, newRow: payload.new, oldRow: payload.old });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Channel active
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn("Realtime indisponible:", err);
    return () => {};
  }
}

