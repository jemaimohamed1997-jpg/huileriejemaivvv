import React, { useState } from 'react';
import { X, CheckCircle, Cog, Lock, AlertTriangle, ArrowRight, Info } from 'lucide-react';
import { OliveReception, ProductionBatch, MillingPaymentMode, OilDestination } from '../../types/production';
import { TankStockDetail } from '../../types/stock';
import { translations, Language } from '../../lib/i18n';

interface ProductionEntryModalProps {
  reception: OliveReception;
  tanks: TankStockDetail[];
  currentOperator: string;
  defaultDensity: number;
  defaultMillingFeePerKg: number;
  lang: Language;
  onClose: () => void;
  onSubmit: (batch: ProductionBatch, optionalDepositTankId?: string) => void;
}

export const ProductionEntryModal: React.FC<ProductionEntryModalProps> = ({
  reception,
  tanks,
  currentOperator,
  defaultDensity = 0.918,
  defaultMillingFeePerKg = 0.080,
  lang,
  onClose,
  onSubmit
}) => {
  const t = translations[lang];

  const [pressLine, setPressLine] = useState<string>('Ligne Inox 1 (Alfa Laval)');
  const [unit, setUnit] = useState<'KG' | 'L'>('L');
  const [inputQuantity, setInputQuantity] = useState<number>(250);
  const [density, setDensity] = useState<number>(defaultDensity);

  const [feeRate, setFeeRate] = useState<number>(defaultMillingFeePerKg);
  const [feeMode, setFeeMode] = useState<MillingPaymentMode>('ESPECES');
  const [feePaid, setFeePaid] = useState<boolean>(true);

  const [oilDestination, setOilDestination] = useState<OilDestination>('SORTIE_CLIENT');
  const [selectedStorageTankId, setSelectedStorageTankId] = useState<string>(tanks[0]?.tank.id || '');
  const [notes, setNotes] = useState<string>('');

  // Calculations
  const olivesNetKg = reception.net_weight_kg;

  let oilKg = 0;
  let oilLitres = 0;

  if (unit === 'KG') {
    oilKg = Number(inputQuantity);
    oilLitres = density > 0 ? Math.round((oilKg / density) * 10) / 10 : 0;
  } else {
    oilLitres = Number(inputQuantity);
    oilKg = Math.round((oilLitres * density) * 10) / 10;
  }

  const yieldPercent = olivesNetKg > 0 ? (oilKg / olivesNetKg) * 100 : 0;
  const yieldLPer100Kg = olivesNetKg > 0 ? (oilLitres / olivesNetKg) * 100 : 0;
  const estimatedGrignonsKg = Math.round(olivesNetKg * 0.45);
  const totalMillingFeeTnd = Math.round(olivesNetKg * feeRate * 1000) / 1000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuantity <= 0) {
      alert('Veuillez saisir une quantité d’huile positive.');
      return;
    }

    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `BON-PRD-${year}-${rand}`;

    const batch: ProductionBatch = {
      id: `prd-${Date.now()}`,
      ticket_number: ticketNumber,
      reception_id: reception.id,
      reception_ticket: reception.ticket_number,
      party_id: reception.party_id,
      party_name: reception.party_name,
      party_code: reception.party_code,
      olives_net_kg: olivesNetKg,
      press_line: pressLine,
      oil_input_unit: unit,
      oil_quantity_entered: Number(inputQuantity),
      oil_density: density,
      oil_quantity_kg: oilKg,
      oil_quantity_litres: oilLitres,
      yield_percentage: Math.round(yieldPercent * 100) / 100,
      yield_litres_per_100kg: Math.round(yieldLPer100Kg * 100) / 100,
      grignons_estimated_kg: estimatedGrignonsKg,
      milling_fee_rate: feeRate,
      milling_fee_mode: feeMode,
      milling_fee_total_tnd: totalMillingFeeTnd,
      milling_fee_paid: feePaid,
      operator: currentOperator,
      status: 'CONFIRME',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      is_confirmed: true, // Permanent ordinary editing lock
      confirmed_by: currentOperator,
      confirmed_at: new Date().toISOString(),
      oil_destination: oilDestination,
      destination_tank_id: oilDestination === 'STOCKAGE_CUVE' ? selectedStorageTankId : undefined,
      notes: notes.trim() || null,
      created_at: new Date().toISOString()
    };

    onSubmit(batch, oilDestination === 'STOCKAGE_CUVE' ? selectedStorageTankId : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cog className="w-5 h-5 text-amber-400 animate-spin-slow" />
            <div>
              <h2 className="font-bold text-base">
                Saisie Opérateur & Rendement d'Huile
              </h2>
              <span className="text-xs text-stone-400">
                Lot d'olives: {reception.party_name} ({reception.net_weight_kg} KG {reception.olive_variety})
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Machine Line */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Ligne de Presse / Broyeur *
              </label>
              <select
                value={pressLine}
                onChange={(e) => setPressLine(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium"
              >
                <option value="Ligne Inox 1 (Alfa Laval)">Ligne Inox 1 (Alfa Laval - 3 tonnes/h)</option>
                <option value="Ligne Inox 2 (Pieralisi)">Ligne Inox 2 (Pieralisi - 2.5 tonnes/h)</option>
                <option value="Ligne Traditionnelle">Ligne Traditionnelle (Super-Presses)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Densité de l'huile (KG / L)
              </label>
              <input
                type="number"
                step="0.001"
                min="0.900"
                max="0.930"
                value={density}
                onChange={(e) => setDensity(Number(e.target.value))}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono"
              />
              <span className="text-[10px] text-stone-400">Standard huile d'olive vierge: 0.916 à 0.920</span>
            </div>
          </div>

          {/* Saisie Quantité en KG ou L */}
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-950">
                Quantité d'Huile Extraite Obtenue *
              </label>
              {/* Unit Toggle Buttons */}
              <div className="inline-flex bg-amber-200/60 p-0.5 rounded-lg border border-amber-300">
                <button
                  type="button"
                  onClick={() => setUnit('L')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    unit === 'L' ? 'bg-amber-600 text-white shadow-2xs' : 'text-amber-900 hover:text-amber-950'
                  }`}
                >
                  En Litres (L)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('KG')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    unit === 'KG' ? 'bg-amber-600 text-white shadow-2xs' : 'text-amber-900 hover:text-amber-950'
                  }`}
                >
                  En Kilogrammes (KG)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={inputQuantity}
                  onChange={(e) => setInputQuantity(Number(e.target.value))}
                  required
                  placeholder={`Quantité en ${unit}`}
                  className="w-full p-3 pr-12 bg-white border border-amber-300 rounded-lg text-lg font-mono font-black text-amber-950 focus:ring-2 focus:ring-amber-500/20"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-amber-700">
                  {unit}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs min-w-[160px] text-right font-mono">
                <span className="text-[10px] text-stone-500 block uppercase font-sans">Équivalent converti</span>
                {unit === 'L' ? (
                  <strong className="text-sm text-stone-900 block">{oilKg} KG</strong>
                ) : (
                  <strong className="text-sm text-stone-900 block">{oilLitres} Litres</strong>
                )}
              </div>
            </div>

            {/* Real-time Yield Display */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                <span className="text-[10px] text-stone-500 block font-semibold">Rendement Huile %</span>
                <span className="font-mono text-base font-black text-emerald-700">{yieldPercent.toFixed(2)} %</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                <span className="text-[10px] text-stone-500 block font-semibold">Litres / 100 KG</span>
                <span className="font-mono text-base font-black text-amber-900">{yieldLPer100Kg.toFixed(2)} L</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                <span className="text-[10px] text-stone-500 block font-semibold">Faytous (Grignons) est.</span>
                <span className="font-mono text-base font-bold text-stone-800">{estimatedGrignonsKg} KG</span>
              </div>
            </div>
          </div>

          {/* Milling Fees */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
              Frais de Trituration (أتعاب العصر)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Tarif par KG d'olives (TND)
                </label>
                <input
                  type="number"
                  step="0.005"
                  min="0"
                  value={feeRate}
                  onChange={(e) => setFeeRate(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-stone-300 rounded text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Mode de Paiement
                </label>
                <select
                  value={feeMode}
                  onChange={(e) => setFeeMode(e.target.value as MillingPaymentMode)}
                  className="w-full p-2 bg-white border border-stone-300 rounded text-xs font-medium"
                >
                  <option value="ESPECES">Espèces (نقدا)</option>
                  <option value="NATURE">En Nature / Fayda (فائدة زيت)</option>
                  <option value="CHEQUE">Chèque (شيك)</option>
                  <option value="A_TERME">À terme / Crédit (مؤجل)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Total Frais Dû
                </label>
                <div className="p-2 bg-amber-100 border border-amber-300 rounded text-xs font-mono font-black text-amber-950 text-center">
                  {totalMillingFeeTnd.toFixed(3)} TND
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="feePaid"
                checked={feePaid}
                onChange={(e) => setFeePaid(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="feePaid" className="text-xs text-stone-700 font-medium cursor-pointer">
                Frais de trituration payés immédiatement par le producteur
              </label>
            </div>
          </div>

          {/* Oil Destination Selection (CRITICAL BUSINESS RULE 10) */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  Destination de l'huile extraite :
                </span>
                <span className="text-[11px] text-stone-500">
                  Règle métier stricte : L'huile produite reste dans l'historique du client et n'entre pas automatiquement dans les cuves de stockage.
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50">
                <input
                  type="radio"
                  name="destination"
                  value="SORTIE_CLIENT"
                  checked={oilDestination === 'SORTIE_CLIENT'}
                  onChange={() => setOilDestination('SORTIE_CLIENT')}
                  className="w-4 h-4 text-amber-600"
                />
                <span className="text-xs font-semibold text-stone-800">
                  Enlèvement immédiat par le client (Le producteur repart avec ses bidons)
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50">
                <input
                  type="radio"
                  name="destination"
                  value="STOCKAGE_CUVE"
                  checked={oilDestination === 'STOCKAGE_CUVE'}
                  onChange={() => setOilDestination('STOCKAGE_CUVE')}
                  className="w-4 h-4 text-amber-600"
                />
                <span className="text-xs font-semibold text-stone-800">
                  Déposer en Cuve de Stockage (Créer un Bon d'Entrée en Cuve pour ce client)
                </span>
              </label>
            </div>

            {oilDestination === 'STOCKAGE_CUVE' && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-300 text-xs space-y-2">
                <label className="block font-semibold text-amber-950">
                  Sélectionner la cuve de stockage réceptrice :
                </label>
                <select
                  value={selectedStorageTankId}
                  onChange={(e) => setSelectedStorageTankId(e.target.value)}
                  className="w-full p-2 bg-white border border-amber-300 rounded text-xs font-medium"
                >
                  {tanks.map(item => (
                    <option key={item.tank.id} value={item.tank.id}>
                      {item.tank.code} - {item.tank.name} (Capacité libre: {item.remaining_capacity} L)
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-amber-800 block">
                  Cela ajoutera automatiquement {oilLitres} L dans la cuve choisie pour le compte de {reception.party_name}.
                </span>
              </div>
            )}
          </div>

          {/* Permanent Lock Warning */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Verrouillage Définitif de Confirmation (Règle Métier 7) :</strong>
              <span>Dès la validation, cette fiche est définitivement verrouillée pour l'opérateur ordinaire et devient immuable dans l'historique du client.</span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-2xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirmer la Production & Verrouiller</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
