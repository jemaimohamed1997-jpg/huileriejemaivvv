import React, { useState } from 'react';
import { Scale, Search, Plus, Printer, FileSpreadsheet, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { OliveReception } from '../../types/production';
import { translations, Language } from '../../lib/i18n';

interface OliveReceptionsListProps {
  receptions: OliveReception[];
  lang: Language;
  onNewReception: () => void;
  onSendToQueue: (receptionId: string) => void;
  onPrintTicket: (reception: OliveReception) => void;
  onExportExcel: () => void;
}

export const OliveReceptionsList: React.FC<OliveReceptionsListProps> = ({
  receptions,
  lang,
  onNewReception,
  onSendToQueue,
  onPrintTicket,
  onExportExcel
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = receptions.filter(r => {
    const matchesSearch = r.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.olive_variety.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOlivesKg = filtered.reduce((sum, r) => sum + r.net_weight_kg, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium block">Total Arrivages Enregistrés</span>
            <span className="font-mono text-2xl font-black text-stone-900">{receptions.length}</span>
          </div>
          <div className="p-2.5 bg-stone-100 text-stone-700 rounded-lg">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium block">Total Olives Net (Filtre actuel)</span>
            <span className="font-mono text-2xl font-black text-amber-900">{totalOlivesKg.toLocaleString()} KG</span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium block">En Attente de Presse</span>
            <span className="font-mono text-2xl font-black text-emerald-700">
              {receptions.filter(r => r.status === 'EN_FILE' || r.status === 'RECU').length} lots
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher par producteur, ticket, variété..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'RECU', 'EN_FILE', 'TERMINE'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st === 'ALL' && 'Tous les arrivages'}
              {st === 'RECU' && 'Reçus simples'}
              {st === 'EN_FILE' && 'En file d’attente'}
              {st === 'TERMINE' && 'Triturés (Terminés)'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={onNewReception}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newOliveReception}</span>
          </button>
        </div>
      </div>

      {/* Receptions Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Ticket & Date</th>
                <th className="p-3.5">Producteur / Client</th>
                <th className="p-3.5">Variété & Caisses</th>
                <th className="p-3.5 text-right">Poids Net</th>
                <th className="p-3.5">Qualité</th>
                <th className="p-3.5">Statut</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length > 0 ? (
                filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-stone-900 block">
                        {rec.ticket_number}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(rec.date).toLocaleString('fr-TN')}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-stone-900 block">
                        {rec.party_name}
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {rec.party_code || 'CLI'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-medium text-stone-800 block">
                        {rec.olive_variety}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {rec.boxes_count} caisses/sacs
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <span className="font-mono font-black text-amber-950 text-sm block">
                        {rec.net_weight_kg.toLocaleString()} KG
                      </span>
                      <span className="text-[10px] text-stone-400">
                        Brut {rec.gross_weight_kg} · Tare {rec.tare_weight_kg}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="text-stone-700 font-medium">
                        {rec.quality}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {rec.status === 'TERMINE' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Trituré
                        </span>
                      )}
                      {rec.status === 'EN_FILE' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                          <Clock className="w-3 h-3 text-amber-600" />
                          En File
                        </span>
                      )}
                      {rec.status === 'RECU' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded">
                          Reçu
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {rec.status === 'RECU' && (
                          <button
                            onClick={() => onSendToQueue(rec.id)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded font-semibold text-[11px] flex items-center gap-1"
                            title="Envoyer en file de trituration"
                          >
                            <span>En File</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          onClick={() => onPrintTicket(rec)}
                          className="p-1.5 hover:bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 rounded"
                          title="Imprimer le ticket"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400 italic">
                    Aucune réception d'olives trouvée.
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
