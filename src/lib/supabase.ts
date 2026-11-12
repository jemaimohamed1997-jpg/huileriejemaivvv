/**
 * Supabase client and sync engine for Huilerie Jemai
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Tank, Party, Operation, TankMovement, UserProfile, AppSettings } from '../types/stock';
import { OliveReception, ProductionBatch, GrignonSale, AuditLog } from '../types/production';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vtyytslihvjmyelhahum.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_LXJ1R8X0W01sc44edNemwA_pjCRXt6j';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Default initial data if database is empty or offline
export const DEFAULT_APP_SETTINGS: AppSettings = {
  id: 'default',
  company_name: 'HUILERIE JEMAI',
  arabic_subtitle: 'معصرة جماعي لإنتاج وتخزين زيت الزيتون',
  phone: '+216 98 000 000',
  address: 'Route Principale des Oliviers - Tunisie',
  unit: 'L',
  threshold: 85,
  oil_density: 0.918,
  default_milling_fee_per_kg: 0.080,
  settings_json: {
    unite: 'L',
    precisionDecimales: 1,
    alertSeuilRemplissage: 85,
  }
};

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user-1',
    username: 'wizz',
    display_name: 'Mohamed Jemai (Gérant)',
    role: 'admin',
    phone: '+216 98 123 456',
    is_active: true
  },
  {
    id: 'user-2',
    username: 'operateur',
    display_name: 'Opérateur Cuverie & Pesée',
    role: 'operateur',
    phone: '+216 98 000 000',
    is_active: true
  },
  {
    id: 'user-1794111958430',
    username: 'Achref',
    display_name: 'Achref (Opérateur)',
    role: 'operateur',
    phone: null,
    is_active: true
  }
];

export async function fetchLiveTanks(): Promise<Tank[]> {
  try {
    const { data, error } = await supabase
      .from('tanks')
      .select('*')
      .order('code', { ascending: true });
    if (error || !data) throw error;
    return data as Tank[];
  } catch (err) {
    console.warn('Fallback: could not load tanks from Supabase, reading local cache', err);
    const local = localStorage.getItem('huilerie_tanks');
    return local ? JSON.parse(local) : [];
  }
}

export async function fetchLiveParties(): Promise<Party[]> {
  try {
    const { data, error } = await supabase
      .from('parties')
      .select('*')
      .order('name', { ascending: true });
    if (error || !data) throw error;
    return data as Party[];
  } catch (err) {
    console.warn('Fallback: could not load parties from Supabase, reading local cache', err);
    const local = localStorage.getItem('huilerie_parties');
    return local ? JSON.parse(local) : [];
  }
}

export async function fetchLiveOperations(): Promise<Operation[]> {
  try {
    const { data, error } = await supabase
      .from('operations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) throw error;
    return data as Operation[];
  } catch (err) {
    console.warn('Fallback: could not load operations from Supabase, reading local cache', err);
    const local = localStorage.getItem('huilerie_operations');
    return local ? JSON.parse(local) : [];
  }
}

export async function fetchLiveTankMovements(): Promise<TankMovement[]> {
  try {
    const { data, error } = await supabase
      .from('tank_movements')
      .select('*')
      .order('created_at', { ascending: true });
    if (error || !data) throw error;
    return data as TankMovement[];
  } catch (err) {
    console.warn('Fallback: could not load tank_movements from Supabase, reading local cache', err);
    const local = localStorage.getItem('huilerie_tank_movements');
    return local ? JSON.parse(local) : [];
  }
}

export async function fetchLiveAppSettings(): Promise<AppSettings> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
      .single();
    if (error || !data) throw error;
    return {
      ...DEFAULT_APP_SETTINGS,
      ...data,
      oil_density: data.settings_json?.oil_density || DEFAULT_APP_SETTINGS.oil_density,
      default_milling_fee_per_kg: data.settings_json?.default_milling_fee_per_kg || DEFAULT_APP_SETTINGS.default_milling_fee_per_kg,
    };
  } catch (err) {
    const local = localStorage.getItem('huilerie_app_settings');
    return local ? JSON.parse(local) : DEFAULT_APP_SETTINGS;
  }
}

export async function saveLiveOperation(
  operation: Operation,
  tankMovements: TankMovement[]
): Promise<boolean> {
  try {
    // 1. Insert Operation
    const { error: opErr } = await supabase
      .from('operations')
      .upsert({
        id: operation.id,
        doc_number: operation.doc_number,
        type: operation.type,
        party_id: operation.party_id,
        operator: operation.operator,
        total_quantity: operation.total_quantity,
        notes: operation.notes,
        status: operation.status,
        operation_date: operation.operation_date,
      });

    if (opErr) {
      console.warn('Direct Supabase operation insert notice:', opErr.message);
    }

    // 2. Insert Tank Movements
    if (tankMovements && tankMovements.length > 0) {
      const { error: tmErr } = await supabase
        .from('tank_movements')
        .upsert(tankMovements.map(tm => ({
          id: tm.id,
          operation_id: tm.operation_id,
          tank_id: tm.tank_id,
          party_id: tm.party_id,
          direction: tm.direction,
          quantity: tm.quantity,
          notes: tm.notes,
          created_at: tm.created_at || new Date().toISOString()
        })));
      if (tmErr) {
        console.warn('Tank movements insert notice:', tmErr.message);
      }
    }
    return true;
  } catch (e) {
    console.warn('Sync notice: operation saved locally', e);
    return false;
  }
}
