import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  User, 
  ShieldAlert
} from 'lucide-react';
import { CuveDetails, Client, UserSession, AppSettings, Movement, ClientBalance } from '../types';

interface MovementTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  cuvesDetails: CuveDetails[];
  clients: Client[];
  clientBalances: ClientBalance[];
  initialCuveSourceId?: string;
  currentUser: UserSession;
  onSubmit: (params: {
    clientId: string;
    cuveSourceId: string;
    cuveDestId: string;
    quantite: number;
    utilisateur: string;
    motif?: string;
  }) => Promise<{ sortie: Movement; entree: Movement }> | { sortie: Movement; entree: Movement };
  onOpenReceipt: (movement: Movement) => void;
  settings: AppSettings;
}

export const MovementTransferModal: React.FC<MovementTransferModalProps> = ({
  isOpen,
  onClose,
  cuvesDetails,
  clients,
  clientBalances,
  initialCuveSourceId,
  currentUser,
  onSubmit,
  onOpenReceipt,
  settings
}) => {
  const activeCuves = cuvesDetails.filter(c => c.active);

  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedCuveSourceId, setSelectedCuveSourceId] = useState<string>(initialCuveSourceId || (activeCuves[0]?.id || ''));
  const [selectedCuveDestId, setSelectedCuveDestId] = useState<string>('');
  const [quantite, setQuantite] = useState<string>('500');
  const [motif, setMotif] = useState<string>('Transvasement pour décantation / filtration');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const currentClientBalance = clientBalances.find(cb => cb.client.id === selectedClientId);

  // Cuves où ce client a du stock
  const cuvesWithClientStock = currentClientBalance?.parCuve || [];

  useEffect(() => {
    if (initialCuveSourceId) {
      setSelectedCuveSourceId(initialCuveSourceId);
    } else if (cuvesWithClientStock.length > 0) {
      setSelectedCuveSourceId(cuvesWithClientStock[0].cuve.id);
    }
  }, [initialCuveSourceId, selectedClientId, cuvesWithClientStock.length]);

  // Choisir une cuve de destination par défaut différente de la source
  useEffect(() => {
    const defaultDest = activeCuves.find(c => c.id !== selectedCuveSourceId);
    if (defaultDest) {
      setSelectedCuveDestId(defaultDest.id);
    }
  }, [selectedCuveSourceId]);

  if (!isOpen) return null;

  const currentSourceItem = cuvesWithClientStock.find(item => item.cuve.id === selectedCuveSourceId);
  const soldeClientSource = currentSourceItem ? currentSourceItem.quantite : 0;
  
  const destCuve = activeCuves.find(c => c.id === selectedCuveDestId);
  const capDestLibre = destCuve ? destCuve.capaciteRestante : 0;

  const numQty = parseFloat(quantite) || 0;
  const isOverSource = numQty > soldeClientSource;
  const isOverDest = numQty > capDestLibre;
  const isSameCuve = selectedCuveSourceId === selectedCuveDestId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');

    if (isSameCuve) {
      setErrorMessage("La cuve source et la cuve destination doivent être différentes.");
      return;
    }

    if (numQty <= 0) {
      setErrorMessage("La quantité à transférer doit être strictement positive.");
      return;
    }

    if (isOverSource) {
      setErrorMessage(
        `Solde source insuffisant : Le client ne dispose que de ${soldeClientSource.toLocaleString('fr-FR')} L dans la cuve source. Transfert de ${numQty.toLocaleString('fr-FR')} L refusé !`
      );
      return;
    }

    if (isOverDest) {
      setErrorMessage(
        `Capacité destination insuffisante : La cuve destination ne peut accueillir que ${capDestLibre.toLocaleString('fr-FR')} L. Transfert de ${numQty.toLocaleString('fr-FR')} L refusé !`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmit({
        clientId: selectedClientId,
        cuveSourceId: selectedCuveSourceId,
        cuveDestId: selectedCuveDestId,
        quantite: numQty,
        utilisateur: currentUser.nomAffiche,
        motif
      });

      onClose();
      onOpenReceipt(res.sortie);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur de transfert");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900">
                Transfert d'Huile Inter-Cuves
              </h3>
              <p className="text-xs text-stone-500">
                Déplacement traçable d'une pile à une autre pour un même client
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-xs text-red-700 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Sélection Client */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Client / Déposant Propriétaire *
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
            >
              {clients.map(c => {
                const bal = clientBalances.find(b => b.client.id === c.id);
                const tot = bal ? bal.totalStock : 0;
                return (
                  <option key={c.id} value={c.id}>
                    {c.codeClient} - {c.nomComplet} (Stock total: {tot.toLocaleString('fr-FR')} L)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Cuve Source */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Cuve Origine (Source) *
              </label>
              <select
                value={selectedCuveSourceId}
                onChange={(e) => setSelectedCuveSourceId(e.target.value)}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
              >
                {activeCuves.map(cu => {
                  const solde = currentClientBalance?.parCuve.find(p => p.cuve.id === cu.id)?.quantite || 0;
                  return (
                    <option key={cu.id} value={cu.id}>
                      {cu.numero} (Solde: {solde.toLocaleString('fr-FR')} L)
                    </option>
                  );
                })}
              </select>
              <div className="text-[11px] text-stone-500 mt-1">
                Disponible : <strong className="text-amber-800">{soldeClientSource.toLocaleString('fr-FR')} L</strong>
              </div>
            </div>

            {/* Cuve Destination */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Cuve Destination *
              </label>
              <select
                value={selectedCuveDestId}
                onChange={(e) => setSelectedCuveDestId(e.target.value)}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
              >
                {activeCuves.map(cu => (
                  <option key={cu.id} value={cu.id} disabled={cu.id === selectedCuveSourceId}>
                    {cu.numero} - {cu.nom} ({cu.capaciteRestante.toLocaleString('fr-FR')} L libre)
                  </option>
                ))}
              </select>
              <div className="text-[11px] text-stone-500 mt-1">
                Place libre : <strong className="text-emerald-800">{capDestLibre.toLocaleString('fr-FR')} L</strong>
              </div>
            </div>
          </div>

          {/* Quantité */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-stone-700">
                Quantité Transférée (Litres) *
              </label>
              {(isOverSource || isOverDest) && (
                <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {isOverSource ? "Solde source insuffisant" : "Capacité destination dépassée"}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                className={`w-full px-3 py-3 sm:py-2.5 border rounded-xl text-xl sm:text-lg font-mono font-bold focus:ring-2 focus:outline-none ${
                  isOverSource || isOverDest 
                    ? 'border-red-500 bg-red-50 text-red-900 focus:ring-red-400' 
                    : 'border-stone-300 focus:ring-sky-600 text-stone-900'
                }`}
                placeholder="0.0"
              />
              <span className="absolute right-3 top-3.5 sm:top-3 text-xs font-bold text-stone-400">
                Litres ({settings.unite})
              </span>
            </div>

            {/* Quick volume chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[100, 250, 500, 1000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQuantite(String(val))}
                  className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-stone-100 hover:bg-sky-50 hover:text-sky-800 border border-stone-200 transition cursor-pointer active:scale-95"
                >
                  {val} L
                </button>
              ))}
              {soldeClientSource > 0 && (
                <button
                  type="button"
                  onClick={() => setQuantite(String(Math.min(soldeClientSource, capDestLibre)))}
                  className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-sky-50 text-sky-800 border border-sky-300 transition cursor-pointer active:scale-95"
                >
                  Max possible ({Math.min(soldeClientSource, capDestLibre)} L)
                </button>
              )}
            </div>
          </div>

          {/* Motif */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Motif du Transfert
            </label>
            <input
              type="text"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="ex: Décantation, regroupement de lots, maintenance de cuve..."
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-600 focus:outline-none"
            />
          </div>

          {/* Opérateur */}
          <div className="bg-stone-50 px-3 py-2 rounded-lg text-xs text-stone-600 flex items-center justify-between border border-stone-200">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-400" />
              Opérateur responsable :
            </span>
            <span className="font-bold text-stone-900">{currentUser.nomAffiche}</span>
          </div>

          {/* Boutons */}
          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOverSource || isOverDest || numQty <= 0 || isSameCuve}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition flex items-center gap-1.5 ${
                isSubmitting || isOverSource || isOverDest || numQty <= 0 || isSameCuve
                  ? 'bg-stone-400 cursor-not-allowed opacity-70'
                  : 'bg-sky-700 hover:bg-sky-600 active:scale-95 cursor-pointer'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Transfert en cours..." : "Exécuter le Transfert Inter-Cuves"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
