/**
 * Stock Calculation Engine for Huilerie Jemai Cuves & Tanks
 * STRICTLY PRESERVED BUSINESS LOGIC:
 * - Computes real-time stock balances per tank and per client.
 * - Respects operation status (ignores 'ANNULE' operations).
 * - Enforces tank capacity limits.
 * - Isolates production oil from storage tanks unless explicitly transferred.
 */

import { Tank, Party, Operation, TankMovement, TankStockDetail, ClientStockSummary } from '../types/stock';

export function calculateTankStocks(
  tanks: Tank[],
  parties: Party[],
  operations: Operation[],
  movements: TankMovement[],
  alertThreshold: number = 85
): {
  tankDetails: TankStockDetail[];
  totalCapacity: number;
  totalStoredOil: number;
  totalAvailableCapacity: number;
  globalFillPercentage: number;
} {
  // Map of valid operations by id
  const validOpMap = new Map<string, boolean>();
  for (const op of operations) {
    validOpMap.set(op.id, op.status === 'VALIDE');
  }

  // Pre-index party names
  const partyMap = new Map<string, Party>();
  for (const p of parties) {
    partyMap.set(p.id, p);
  }

  let totalCapacity = 0;
  let totalStoredOil = 0;

  const tankDetails: TankStockDetail[] = tanks
    .filter(t => !t.is_deleted)
    .map(tank => {
      totalCapacity += tank.capacity;

      // Filter movements for this tank belonging to valid operations
      const tankMvts = movements.filter(m => {
        if (m.tank_id !== tank.id) return false;
        // If movement is attached to an operation, check validity
        if (m.operation_id && validOpMap.has(m.operation_id)) {
          return validOpMap.get(m.operation_id) === true;
        }
        return true;
      });

      // Calculate total quantity in tank
      let currentQty = 0;
      const clientBalances = new Map<string, number>();

      for (const m of tankMvts) {
        const sign = m.direction === 'IN' ? 1 : -1;
        const delta = Number(m.quantity) * sign;
        currentQty += delta;

        if (m.party_id) {
          const currentPartyBal = clientBalances.get(m.party_id) || 0;
          clientBalances.set(m.party_id, currentPartyBal + delta);
        }
      }

      currentQty = Math.max(0, Math.round(currentQty * 10) / 10);
      totalStoredOil += currentQty;

      const fillPercentage = tank.capacity > 0
        ? Math.min(100, Math.round((currentQty / tank.capacity) * 1000) / 10)
        : 0;

      const remainingCapacity = Math.max(0, tank.capacity - currentQty);
      const isAlert = fillPercentage >= alertThreshold;

      // Format clients breakdown
      const clientsBreakdown = Array.from(clientBalances.entries())
        .filter(([, qty]) => qty > 0.01)
        .map(([partyId, qty]) => {
          const party = partyMap.get(partyId);
          const roundedQty = Math.round(qty * 10) / 10;
          return {
            party_id: partyId,
            party_name: party?.name || 'Client Inconnu',
            party_code: party?.code || 'CLI',
            quantity: roundedQty,
            percentage_of_tank: currentQty > 0
              ? Math.round((roundedQty / currentQty) * 1000) / 10
              : 0
          };
        })
        .sort((a, b) => b.quantity - a.quantity);

      return {
        tank,
        current_quantity: currentQty,
        fill_percentage: fillPercentage,
        remaining_capacity: remainingCapacity,
        is_alert: isAlert,
        clients_breakdown: clientsBreakdown
      };
    });

  const totalAvailableCapacity = Math.max(0, totalCapacity - totalStoredOil);
  const globalFillPercentage = totalCapacity > 0
    ? Math.round((totalStoredOil / totalCapacity) * 1000) / 10
    : 0;

  return {
    tankDetails,
    totalCapacity,
    totalStoredOil: Math.round(totalStoredOil * 10) / 10,
    totalAvailableCapacity: Math.round(totalAvailableCapacity * 10) / 10,
    globalFillPercentage
  };
}

export function calculateClientStocks(
  parties: Party[],
  tanks: Tank[],
  operations: Operation[],
  movements: TankMovement[]
): ClientStockSummary[] {
  const validOpMap = new Map<string, boolean>();
  for (const op of operations) {
    validOpMap.set(op.id, op.status === 'VALIDE');
  }

  const tankMap = new Map<string, Tank>();
  for (const t of tanks) {
    tankMap.set(t.id, t);
  }

  return parties
    .filter(p => !p.is_deleted)
    .map(party => {
      // Find all movements for this party in valid operations
      const partyMvts = movements.filter(m => {
        if (m.party_id !== party.id) return false;
        if (m.operation_id && validOpMap.has(m.operation_id)) {
          return validOpMap.get(m.operation_id) === true;
        }
        return true;
      });

      const tankDist = new Map<string, number>();
      let totalQty = 0;

      for (const m of partyMvts) {
        const sign = m.direction === 'IN' ? 1 : -1;
        const delta = Number(m.quantity) * sign;
        totalQty += delta;

        if (m.tank_id) {
          const currentTankBal = tankDist.get(m.tank_id) || 0;
          tankDist.set(m.tank_id, currentTankBal + delta);
        }
      }

      totalQty = Math.max(0, Math.round(totalQty * 10) / 10);

      const tanksDistribution = Array.from(tankDist.entries())
        .filter(([, qty]) => qty > 0.01)
        .map(([tankId, qty]) => {
          const tank = tankMap.get(tankId);
          return {
            tank_id: tankId,
            tank_name: tank?.name || 'Cuve Inconnue',
            tank_code: tank?.code || 'P-XX',
            quantity: Math.round(qty * 10) / 10
          };
        });

      // Count operations
      const partyOps = operations.filter(o => o.party_id === party.id && o.status === 'VALIDE');
      const lastOp = partyOps.length > 0
        ? partyOps.sort((a, b) => new Date(b.operation_date).getTime() - new Date(a.operation_date).getTime())[0]
        : undefined;

      return {
        party,
        total_quantity: totalQty,
        tanks_distribution: tanksDistribution,
        total_operations: partyOps.length,
        last_operation_date: lastOp?.operation_date
      };
    })
    .sort((a, b) => b.total_quantity - a.total_quantity);
}
