import React, { useState } from 'react';
import { X, CheckCircle, Scale, Plus } from 'lucide-react';
import { Party } from '../../types/stock';
import { OliveReception, OliveQuality } from '../../types/production';
import { translations, Language } from '../../lib/i18n';

interface OliveReceptionModalProps {
  parties: Party[];
  currentOperator: string;
  lang: Language;
  onClose: () => void;
  onSubmit: (reception: OliveReception, sendToQueue: boolean) => void;
}

export const OliveReceptionModal: React.FC<OliveReceptionModalProps> = ({
  parties,
  currentOperator,
  lang,
  onClose,
  onSubmit
}) => {
  const t = translations[lang];

  const [selectedPartyId, setSelectedPartyId] = useState<string>(parties[0]?.id || 'NEW');
  const [newPartyName, setNewPartyName] = useState<string>('');
  const [newPartyPhone, setNewPartyPhone] = useState<string>('');

  const [oliveVariety, setOliveVariety] = useState<string>('Chemlali');
  const [boxesCount, setBoxesCount] = useState<number>(20);
  const [grossWeight, setGrossWeight] = useState<number>(1250);
  const [tareWeight, setTareWeight] = useState<number>(250);
  const [quality, setQuality] = useState<OliveQuality>('Superieure');
  const [notes, setNotes] = useState<string>('');
  const [sendDirectlyToQueue, setSendDirectlyToQueue] = useState<boolean>(true);

  // Auto-calculated net weight
  const netWeight = Math.max(0, grossWeight - tareWeight);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (netWeight <= 0) {
      alert('Le poids net doit être supérieur à zéro.');
      return;
    }

    let partyName = '';
    let partyCode = 'CLI';
    let partyId = selectedPartyId;

    if (selectedPartyId === 'NEW') {
      partyName = newPartyName.trim() || 'Nouveau Client';
      partyId = `cli-${Date.now()}`;
    } else {
      const p = parties.find(item => item.id === selectedPartyId);
      partyName = p?.name || 'Client';
      partyCode = p?.code || 'CLI';
    }

    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `BON-OLV-${year}-${rand}`;

    const reception: OliveReception = {
      id: `olv-${Date.now()}`,
      ticket_number: ticketNumber,
      date: new Date().toISOString(),
      party_id: partyId,
      party_name: partyName,
      party_code: partyCode,
      olive_variety: oliveVariety,
      boxes_count: Number(boxesCount),
      gross_weight_kg: Number(grossWeight),
      tare_weight_kg: Number(tareWeight),
      net_weight_kg: Number(netWeight),
      quality: quality,
      status: sendDirectlyToQueue ? 'EN_FILE' : 'RECU',
      notes: notes.trim() || null,
      operator: currentOperator,
      created_at: new Date().toISOString()
    };

    onSubmit(reception, sendDirectlyToQueue);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-base">
              {t.newOliveReception}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Client Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700">
              {t.client} *
            </label>
            <select
              value={selectedPartyId}
              onChange={(e) => setSelectedPartyId(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium"
            >
              {parties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
              <option value="NEW">+ Nouveau Producteur / Non Enregistré</option>
            </select>

            {selectedPartyId === 'NEW' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/60 rounded-lg border border-amber-200">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Nom Complet du Producteur *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPartyName}
                    onChange={(e) => setNewPartyName(e.target.value)}
                    placeholder="Ex: Ali Trabelsi"
                    className="w-full p-2 bg-white border border-stone-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    value={newPartyPhone}
                    onChange={(e) => setNewPartyPhone(e.target.value)}
                    placeholder="Ex: 98 123 456"
                    className="w-full p-2 bg-white border border-stone-300 rounded text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Variety and Boxes count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.oliveVariety}
              </label>
              <select
                value={oliveVariety}
                onChange={(e) => setOliveVariety(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium"
              >
                <option value="Chemlali">Chemlali (شملالي)</option>
                <option value="Chétoui">Chétoui (شتوي)</option>
                <option value="Sahli">Sahli (ساحلي)</option>
                <option value="Zarrazi">Zarrazi (زرازي)</option>
                <option value="Oueslati">Oueslati (وسلاتي)</option>
                <option value="Mélange">Mélange / Tout-Venant (خليط)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.boxesCount}
              </label>
              <input
                type="number"
                min="1"
                value={boxesCount}
                onChange={(e) => setBoxesCount(Number(e.target.value))}
                required
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium"
              />
            </div>
          </div>

          {/* Weighing Section */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Pesée à la Bascule (KG)
              </span>
              <span className="text-[11px] text-stone-500">Unité: Kilogrammes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Poids Brut (KG)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(Number(e.target.value))}
                  required
                  className="w-full p-2 bg-white border border-stone-300 rounded text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Tare (Caisses/Camion)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={tareWeight}
                  onChange={(e) => setTareWeight(Number(e.target.value))}
                  required
                  className="w-full p-2 bg-white border border-stone-300 rounded text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-800 mb-1">
                  Poids Net d'Olives
                </label>
                <div className="p-2 bg-amber-50 border border-amber-300 rounded text-xs font-mono font-black text-amber-950 text-center">
                  {netWeight} KG
                </div>
              </div>
            </div>
          </div>

          {/* Quality Assessment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.quality}
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as OliveQuality)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium"
              >
                <option value="Superieure">Supérieure / Saine (ممتازة / سليمة)</option>
                <option value="Standard">Standard (عادية)</option>
                <option value="Feuilles_Tiges">Avec Feuilles & Rameaux (بأوراق وأغصان)</option>
                <option value="Piquee">Piquée / Tombée au sol (ساقطة / مصابة)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Remarques / Parcelle
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Récolte du matin, verger Sidi Bou..."
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Direct Queue Assignment Checkbox */}
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-stone-900 block">
                Mettre directement en file d'attente de trituration ?
              </span>
              <span className="text-[11px] text-stone-500">
                Rend le lot immédiatement disponible pour l'opérateur de presse
              </span>
            </div>
            <input
              type="checkbox"
              checked={sendDirectlyToQueue}
              onChange={(e) => setSendDirectlyToQueue(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
          </div>

          {/* Buttons */}
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
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Enregistrer & Émettre le Ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
