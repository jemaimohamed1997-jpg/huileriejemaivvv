/**
 * Types for the original Gestion de Stock Huilerie Jemai module
 * STRICTLY PRESERVED AND PROTECTED: Cuves, Parties, Operations, TankMovements
 */

export type TankDirection = 'IN' | 'OUT';

export interface Tank {
  id: string;
  code: string;
  name: string;
  capacity: number;
  is_active: boolean;
  notes?: string | null;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Party {
  id: string;
  code: string;
  name: string;
  phone?: string | null;
  notes?: string | null;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TankAllocation {
  tank_id: string;
  quantity: number; // in Litres (or standard app unit)
}

export interface Operation {
  id: string;
  doc_number: string; // e.g. BON-REC-2026-0001, BON-SOR-2026-0001, BON-TRA-2026-0001
  type: 'ENTREE' | 'SORTIE' | 'TRANSFERT';
  party_id: string;
  operator: string;
  total_quantity: number;
  notes?: string | null;
  status: 'VALIDE' | 'ANNULE';
  operation_date: string;
  created_at?: string;
  updated_at?: string;
  // For transfer: source_tank_id, target_tank_id
  source_tank_id?: string;
  target_tank_id?: string;
  allocations?: TankAllocation[];
}

export interface TankMovement {
  id: string;
  operation_id: string;
  tank_id: string;
  party_id: string;
  direction: TankDirection;
  quantity: number;
  notes?: string | null;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  role: 'admin' | 'operateur';
  phone?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AppSettings {
  id: string;
  company_name: string;
  arabic_subtitle: string;
  phone: string;
  address: string;
  unit: string;
  threshold: number; // Filling threshold alert %
  oil_density: number; // standard 0.918 kg/L
  default_milling_fee_per_kg: number; // e.g. 0.080 TND/kg
  settings_json?: Record<string, unknown>;
  updated_at?: string;
}

export interface TankStockDetail {
  tank: Tank;
  current_quantity: number;
  fill_percentage: number;
  remaining_capacity: number;
  is_alert: boolean;
  clients_breakdown: {
    party_id: string;
    party_name: string;
    party_code: string;
    quantity: number;
    percentage_of_tank: number;
  }[];
}

export interface ClientStockSummary {
  party: Party;
  total_quantity: number;
  tanks_distribution: {
    tank_id: string;
    tank_name: string;
    tank_code: string;
    quantity: number;
  }[];
  total_operations: number;
  last_operation_date?: string;
}
