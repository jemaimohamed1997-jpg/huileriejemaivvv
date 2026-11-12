import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Calendar, 
  Users, 
  Layers, 
  TrendingUp, 
  Clock, 
  FileText,
  Search
} from 'lucide-react';
import { CuveDetails, Client, Movement, AppSettings, Cuve } from '../types';
import { exporterSituationStockExcel, exporterHistoriqueMouvementsExcel, exporterReleveClientExcel } from '../services/excelExport';

interface ReportsManagerProps {
  cuvesDetails: CuveDetails[];
  cuves: Cuve[];
  clients: Client[];
  mouvements: Movement[];
  onPrintBon: (mouv: Movement) => void;
  settings: AppSettings;
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({
  cuvesDetails,
  cuves,
  clients,
  mouvements,
  onPrintBon,
  settings
}) => {
  const [reportType, setReportType] = useState<'situation' | 'client' | 'cuve' | 'periode'>('situation');
  
  // Filtres
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedCuveId, setSelectedCuveId] = useState<string>(cuves[0]?.id || '');
  const [selectedPeriod, setSelectedPeriod] = useState<'jour' | 'mois' | 'annee'>('mois');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Client sélectionné
  const currentClient = clients.find(c => c.id === selectedClientId);
  const clientMouvements = mouvements.filter(m => m.clientId === selectedClientId);
  const clientSoldeTotal = clientMouvements
    .filter(m => !m.estAnnule)
    .reduce((acc, m) => {
      if (m.typeMouvement === 'ENTREE' || m.typeMouvement === 'TRANSFERT_ENTREE') return acc + m.quantite;
      if (m.typeMouvement === 'SORTIE' || m.typeMouvement === 'TRANSFERT_SORTIE') return acc - m.quantite;
      return acc;
    }, 0);

  // Cuve sélectionnée
  const currentCuve = cuvesDetails.find(c => c.id === selectedCuveId);
  const cuveMouvements = mouvements.filter(m => m.cuveId === selectedCuveId);

  // Mouvements selon période
  const filteredByPeriod = mouvements.filter(m => {
    if (selectedPeriod === 'jour') {
      return m.dateMouvement.slice(0, 10) === customDate;
    } else if (selectedPeriod === 'mois') {
      return m.dateMouvement.slice(0, 7) === customDate.slice(0, 7);
    } else {
      return m.dateMouvement.slice(0, 4) === customDate.slice(0, 4);
    }
  });

  const totalPeriodEntrees = filteredByPeriod
    .filter(m => (m.typeMouvement === 'ENTREE' || m.typeMouvement === 'TRANSFERT_ENTREE') && !m.estAnnule)
    .reduce((a, m) => a + m.quantite, 0);

  const totalPeriodSorties = filteredByPeriod
    .filter(m => (m.typeMouvement === 'SORTIE' || m.typeMouvement === 'TRANSFERT_SORTIE') && !m.estAnnule)
    .reduce((a, m) => a + m.quantite, 0);

  return (
    <div className="space-y-6">
      
      {/* Sélecteur de type de rapport */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setReportType('situation')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              reportType === 'situation'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Inventaire Global des Cuves</span>
          </button>

          <button
            onClick={() => setReportType('client')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              reportType === 'client'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Relevé Déposant / Client</span>
          </button>

          <button
            onClick={() => setReportType('cuve')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              reportType === 'cuve'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mouvements d'une Cuve</span>
          </button>

          <button
            onClick={() => setReportType('periode')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              reportType === 'periode'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Bilan Périodique (Jour / Mois)</span>
          </button>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimer la page A4</span>
        </button>
      </div>

      {/* 1. Situation du Stock des Cuves */}
      {reportType === 'situation' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-start pb-4 border-b border-stone-200">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Rapport Officiel</span>
              <h2 className="text-lg font-bold text-stone-900 mt-0.5">
                Situation Globale des Piles & Cuves d'Huile
              </h2>
              <p className="text-xs text-stone-500">
                Arrêté au {new Date().toLocaleDateString('fr-FR')} &bull; Huilerie Jemai
              </p>
            </div>

            <button
              onClick={() => exporterSituationStockExcel(cuvesDetails, id => {
                const c = cuvesDetails.find(x => x.id === id);
                return c ? c.stockActuel : 0;
              }, settings.nomEntreprise)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-emerald-600 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Télécharger Excel (.xlsx)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">N° Pile</th>
                  <th className="py-2.5 px-3">Désignation</th>
                  <th className="py-2.5 px-3 text-right">Capacité Max</th>
                  <th className="py-2.5 px-3 text-right">Stock Actuel</th>
                  <th className="py-2.5 px-3 text-right">Disponible</th>
                  <th className="py-2.5 px-3 text-center">Taux</th>
                  <th className="py-2.5 px-3">Clients Associés</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {cuvesDetails.map(c => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-900">{c.numero}</td>
                    <td className="py-2.5 px-3 font-semibold">{c.nom}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{c.capaciteMax.toLocaleString('fr-FR')} L</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">{c.stockActuel.toLocaleString('fr-FR')} L</td>
                    <td className="py-2.5 px-3 text-right font-mono text-stone-700">{c.capaciteRestante.toLocaleString('fr-FR')} L</td>
                    <td className="py-2.5 px-3 text-center font-bold">{c.tauxRemplissage}%</td>
                    <td className="py-2.5 px-3 text-[11px] text-stone-600">
                      {c.clients.map(cl => `${cl.client.nomComplet} (${cl.quantite}L)`).join(', ') || 'Vide'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Relevé Déposant / Client */}
      {reportType === 'client' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-stone-700">Sélectionner un Client :</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs bg-white font-medium"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.codeClient} - {c.nomComplet}</option>
                ))}
              </select>
            </div>

            {currentClient && (
              <button
                onClick={() => exporterReleveClientExcel(currentClient, clientMouvements, cuves, clientSoldeTotal)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-emerald-600 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Exporter Relevé Client (.xlsx)</span>
              </button>
            )}
          </div>

          {currentClient && (
            <div className="space-y-4">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">{currentClient.nomComplet}</h3>
                  <div className="text-xs text-stone-500 font-mono mt-0.5">
                    {currentClient.codeClient} {currentClient.telephone && `&bull; ${currentClient.telephone}`}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">Solde Net Disponible</span>
                  <div className="text-2xl font-black font-mono text-emerald-800">
                    {clientSoldeTotal.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} L
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-200 rounded-lg">
                  <thead className="bg-stone-100 text-stone-700 font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">N° Bon</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Opération</th>
                      <th className="py-2.5 px-3">Cuve</th>
                      <th className="py-2.5 px-3 text-right">Quantité</th>
                      <th className="py-2.5 px-3 text-center">Bon A4</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {clientMouvements.map(m => {
                      const isEntree = m.typeMouvement === 'ENTREE' || m.typeMouvement === 'TRANSFERT_ENTREE';
                      const cuve = cuves.find(c => c.id === m.cuveId);
                      return (
                        <tr key={m.id} className={m.estAnnule ? 'bg-red-50/30 line-through text-stone-400' : ''}>
                          <td className="py-2.5 px-3 font-mono font-bold text-stone-900">{m.numeroBon}</td>
                          <td className="py-2.5 px-3">{new Date(m.dateMouvement).toLocaleDateString('fr-FR')}</td>
                          <td className="py-2.5 px-3 uppercase font-bold text-[10px]">{m.typeMouvement}</td>
                          <td className="py-2.5 px-3">{cuve ? `${cuve.numero} - ${cuve.nom}` : '-'}</td>
                          <td className={`py-2.5 px-3 text-right font-mono font-bold ${isEntree ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {isEntree ? '+' : '-'}{m.quantite.toLocaleString('fr-FR')} L
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => onPrintBon(m)}
                              className="p-1 text-stone-600 hover:text-emerald-700 cursor-pointer"
                              title="Réimprimer le bon"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Mouvements d'une cuve */}
      {reportType === 'cuve' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
            <label className="text-xs font-bold text-stone-700">Sélectionner la Cuve :</label>
            <select
              value={selectedCuveId}
              onChange={(e) => setSelectedCuveId(e.target.value)}
              className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs bg-white font-medium"
            >
              {cuves.map(c => (
                <option key={c.id} value={c.id}>{c.numero} - {c.nom}</option>
              ))}
            </select>
          </div>

          {currentCuve && (
            <div className="space-y-4">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">{currentCuve.numero} - {currentCuve.nom}</h3>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Capacité max : {currentCuve.capaciteMax.toLocaleString('fr-FR')} L &bull; Libre : {currentCuve.capaciteRestante.toLocaleString('fr-FR')} L
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">Stock Actuel</span>
                  <div className="text-2xl font-black font-mono text-emerald-800">
                    {currentCuve.stockActuel.toLocaleString('fr-FR')} L ({currentCuve.tauxRemplissage}%)
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-200 rounded-lg">
                  <thead className="bg-stone-100 text-stone-700 font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">N° Bon</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3 text-right">Quantité</th>
                      <th className="py-2.5 px-3 text-center">Bon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {cuveMouvements.map(m => {
                      const isEntree = m.typeMouvement === 'ENTREE' || m.typeMouvement === 'TRANSFERT_ENTREE';
                      const cl = clients.find(c => c.id === m.clientId);
                      return (
                        <tr key={m.id} className={m.estAnnule ? 'bg-red-50/30 line-through text-stone-400' : ''}>
                          <td className="py-2.5 px-3 font-mono font-bold text-stone-900">{m.numeroBon}</td>
                          <td className="py-2.5 px-3">{new Date(m.dateMouvement).toLocaleDateString('fr-FR')}</td>
                          <td className="py-2.5 px-3 uppercase font-bold text-[10px]">{m.typeMouvement}</td>
                          <td className="py-2.5 px-3">{cl?.nomComplet}</td>
                          <td className={`py-2.5 px-3 text-right font-mono font-bold ${isEntree ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {isEntree ? '+' : '-'}{m.quantite.toLocaleString('fr-FR')} L
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => onPrintBon(m)}
                              className="p-1 text-stone-600 hover:text-emerald-700 cursor-pointer"
                              title="Réimprimer le bon"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Bilan Périodique */}
      {reportType === 'periode' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-700">Période :</span>
              <div className="flex rounded-lg bg-stone-100 p-0.5 border border-stone-200">
                {(['jour', 'mois', 'annee'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPeriod(p)}
                    className={`px-3 py-1 rounded text-xs font-bold capitalize transition cursor-pointer ${
                      selectedPeriod === p ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <input
                type={selectedPeriod === 'jour' ? 'date' : selectedPeriod === 'mois' ? 'month' : 'number'}
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="px-2.5 py-1 border border-stone-300 rounded text-xs bg-white"
              />
            </div>

            <button
              onClick={() => exporterHistoriqueMouvementsExcel(filteredByPeriod, clients, cuves)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-emerald-600 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Exporter Bilan Période (.xlsx)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
              <span className="text-xs font-bold text-emerald-800 uppercase">Total Entrées Réceptionnées</span>
              <div className="text-2xl font-black text-emerald-900 mt-1">
                +{totalPeriodEntrees.toLocaleString('fr-FR')} Litres
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <span className="text-xs font-bold text-amber-800 uppercase">Total Sorties Livrées</span>
              <div className="text-2xl font-black text-amber-900 mt-1">
                -{totalPeriodSorties.toLocaleString('fr-FR')} Litres
              </div>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border border-stone-200 rounded-lg">
              <thead className="bg-stone-100 text-stone-700 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3">N° Bon</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Cuve</th>
                  <th className="py-2.5 px-3 text-right">Quantité (L)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredByPeriod.map(m => {
                  const isEntree = m.typeMouvement === 'ENTREE' || m.typeMouvement === 'TRANSFERT_ENTREE';
                  const cl = clients.find(c => c.id === m.clientId);
                  const cu = cuves.find(c => c.id === m.cuveId);
                  return (
                    <tr key={m.id} className={m.estAnnule ? 'bg-red-50/30 line-through text-stone-400' : ''}>
                      <td className="py-2 px-3 font-mono font-bold text-stone-900">{m.numeroBon}</td>
                      <td className="py-2 px-3">{new Date(m.dateMouvement).toLocaleDateString('fr-FR')}</td>
                      <td className="py-2 px-3 uppercase text-[10px] font-bold">{m.typeMouvement}</td>
                      <td className="py-2 px-3">{cl?.nomComplet}</td>
                      <td className="py-2 px-3">{cu?.numero}</td>
                      <td className={`py-2 px-3 text-right font-mono font-bold ${isEntree ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isEntree ? '+' : '-'}{m.quantite.toLocaleString('fr-FR')} L
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
