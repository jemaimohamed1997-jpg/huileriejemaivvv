import React, { useState } from 'react';
import { Search, Printer, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, XCircle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { Operation, TankMovement, Party, Tank } from '../../types/stock';
import { translations, Language } from '../../lib/i18n';

interface OperationsListProps {
  operations: Operation[];
  movements: TankMovement[];
  parties: Party[];
  tanks: Tank[];
  currentRole: 'admin' | 'operateur';
  lang: Language;
  onPrintOperation: (operation: Operation, movements: TankMovement[]) => void;
  onCancelOperation?: (operationId: string) => void;
}

export const OperationsList: React.FC<OperationsListProps> = ({
  operations,
  movements,
  parties,
  tanks,
  currentRole,
  lang,
  onPrintOperation,
  onCancelOperation
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const partyMap = new Map<string, Party>();
  for (const p of parties) partyMap.set(p.id, p);

  const tankMap = new Map<string, Tank>();
  for (const t of tanks) tankMap.set(t.id, t);

  const filtered = operations.filter(op => {
    const party = partyMap.get(op.party_id);
    const matchesSearch = op.doc_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (party?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (op.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || op.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher par N° bon, client, note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'ENTREE', 'SORTIE', 'TRANSFERT'].map(tp => (
            <button
              key={tp}
              onClick={() => setTypeFilter(tp)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                typeFilter === tp
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tp === 'ALL' && 'Tous les mouvements'}
              {tp === 'ENTREE' && 'Entrées (Réception)'}
              {tp === 'SORTIE' && 'Sorties (Retrait)'}
              {tp === 'TRANSFERT' && 'Transferts'}
            </button>
          ))}
        </div>
      </div>

      {/* Operations Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">N° Bon & Date</th>
                <th className="p-3.5">Type Mouvement</th>
                <th className="p-3.5">Producteur / Client</th>
                <th className="p-3.5 text-right">Volume Total</th>
                <th className="p-3.5">Détail des Cuves</th>
                <th className="p-3.5">Statut</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length > 0 ? (
                filtered.map((op) => {
                  const party = partyMap.get(op.party_id);
                  const opMovements = movements.filter(m => m.operation_id === op.id);

                  return (
                    <tr key={op.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-stone-900 block">{op.doc_number}</span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(op.operation_date).toLocaleString('fr-TN')}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {op.type === 'ENTREE' && (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                            Entrée Stock
                          </span>
                        )}
                        {op.type === 'SORTIE' && (
                          <span className="inline-flex items-center gap-1 font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                            <ArrowUpRight className="w-3.5 h-3.5 text-stone-600" />
                            Sortie Stock
                          </span>
                        )}
                        {op.type === 'TRANSFERT' && (
                          <span className="inline-flex items-center gap-1 font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                            Transfert Inter-Cuves
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-stone-900 block">
                          {party?.name || op.party_id}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {party?.code || 'CLI'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono font-black text-amber-950 text-sm">
                        {op.total_quantity.toLocaleString()} L
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          {opMovements.length > 0 ? (
                            opMovements.map((m, idx) => {
                              const t = tankMap.get(m.tank_id);
                              return (
                                <div key={idx} className="text-[11px] font-mono text-stone-600">
                                  <span className="font-bold text-stone-800">{t?.code || m.tank_id}</span>: {m.direction === 'IN' ? '+' : '-'}{m.quantity} L
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-[11px] text-stone-400 italic">Mouvement direct</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                          op.status === 'VALIDE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800 line-through'
                        }`}>
                          {op.status === 'VALIDE' ? 'Validé' : 'Annulé'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPrintOperation(op, opMovements)}
                            className="p-1.5 hover:bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 rounded"
                            title="Imprimer le bon officiel"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {currentRole === 'admin' && op.status === 'VALIDE' && onCancelOperation && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Confirmer l'annulation du bon ${op.doc_number} ? Cette action réajustera immédiatement le stock.`)) {
                                  onCancelOperation(op.id);
                                }
                              }}
                              className="p-1.5 hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200 rounded transition-colors"
                              title="Annuler ce bon (Admin)"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400 italic">
                    Aucun mouvement trouvé.
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
