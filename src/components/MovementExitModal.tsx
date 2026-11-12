import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  User, 
  ShieldAlert,
  Layers
} from 'lucide-react';
import { CuveDetails, Client, UserSession, AppSettings, Movement, ClientBalance } from '../types';

interface MovementExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  cuvesDetails: CuveDetails[];
  clients: Client[];
  clientBalances: ClientBalance[];
  initialClientId?: string;
  currentUser: UserSession;
  onSubmit: (params: {
    clientId: string;
    cuveId: string;
    quantite: number;
    utilisateur: string;
    motif?: string;
    observations?: string;
  }) => Promise<Movement> | Movement;
  onOpenReceipt: (movement: Movement) => void;
  settings: AppSettings;
}

export const MovementExitModal: React.FC<MovementExitModalProps> = ({
  isOpen,
  onClose,
  cuvesDetails,
  clients,
  clientBalances,
  initialClientId,
  currentUser,
  onSubmit,
  onOpenReceipt,
  settings
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId || (clients[0]?.id || ''));
  const [selectedCuveId, setSelectedCuveId] = useState<string>('');
  const [quantite, setQuantite] = useState<string>('500');
  const [motif, setMotif] = useState<string>('Retrait producteur / Vente en vrac');
  const [observations, setObservations] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const currentClientBalance = clientBalances.find(cb => cb.client.id === selectedClientId);

  // Cuves où ce client a un solde positif
  const cuvesWithClientStock = currentClientBalance?.parCuve || [];

  useEffect(() => {
    if (initialClientId) {
      setSelectedClientId(initialClientId);
    }
  }, [initialClientId]);

  useEffect(() => {
    if (cuvesWithClientStock.length > 0) {
      setSelectedCuveId(cuvesWithClientStock[0].cuve.id);
    } else {
      setSelectedCuveId('');
    }
  }, [selectedClientId, cuvesWithClientStock.length]);

  if (!isOpen) return null;

  const currentItemInCuve = cuvesWithClientStock.find(item => item.cuve.id === selectedCuveId);
  const soldeClientDansCuve = currentItemInCuve ? currentItemInCuve.quantite : 0;
  const numQty = parseFloat(quantite) || 0;
  const isOverBalance = numQty > soldeClientDansCuve;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');

    if (!selectedCuveId) {
      setErrorMessage("Veuillez sélectionner une cuve contenant du stock pour ce client.");
      return;
    }

    if (numQty <= 0) {
      setErrorMessage("La quantité à retirer doit être supérieure à zéro.");
      return;
    }

    if (isOverBalance) {
      setErrorMessage(
        `Solde insuffisant : Le client ne possède que ${soldeClientDansCuve.toLocaleString('fr-FR')} L dans cette cuve. Sortie de ${numQty.toLocaleString('fr-FR')} L refusée !`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const createdMovement = await onSubmit({
        clientId: selectedClientId,
        cuveId: selectedCuveId,
        quantite: numQty,
        utilisateur: currentUser.nomAffiche,
        motif,
        observations
      });

      onClose();
      onOpenReceipt(createdMovement);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de la sortie d'huile");
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
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900">
                Sortie d'Huile (Livraison / Retrait Déposant)
              </h3>
              <p className="text-xs text-stone-500">
                Contrôle strict du solde client et émission de bon officiel
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
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-stone-700">
                Client / Déposant Bénéficiaire *
              </label>
              {currentClientBalance && (
                <span className="text-xs font-bold text-emerald-800">
                  Total déposé : {currentClientBalance.totalStock.toLocaleString('fr-FR')} L
                </span>
              )}
            </div>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {clients.map(c => {
                const bal = clientBalances.find(b => b.client.id === c.id);
                const tot = bal ? bal.totalStock : 0;
                return (
                  <option key={c.id} value={c.id}>
                    {c.codeClient} - {c.nomComplet} (Solde disponible: {tot.toLocaleString('fr-FR')} L)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sélection de la Cuve où le client a de l'huile */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-stone-700">
                Pile / Cuve Source du Retrait *
              </label>
              {currentItemInCuve && (
                <span className="text-xs font-bold text-amber-700">
                  Solde dans cette cuve : {soldeClientDansCuve.toLocaleString('fr-FR')} L
                </span>
              )}
            </div>

            {cuvesWithClientStock.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                ⚠️ Ce client n'a actuellement aucun stock d'huile déposé dans les cuves de l'huilerie.
              </div>
            ) : (
              <select
                value={selectedCuveId}
                onChange={(e) => setSelectedCuveId(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {cuvesWithClientStock.map(item => (
                  <option key={item.cuve.id} value={item.cuve.id}>
                    {item.cuve.numero} - {item.cuve.nom} (Solde : {item.quantite.toLocaleString('fr-FR')} L)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quantité à retirer */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-stone-700">
                Quantité d'Huile Sortante (Litres) *
              </label>
              {isOverBalance && (
                <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Solde dépassé de {(numQty - soldeClientDansCuve).toFixed(1)} L !
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
                  isOverBalance 
                    ? 'border-red-500 bg-red-50 text-red-900 focus:ring-red-400' 
                    : 'border-stone-300 focus:ring-amber-500 text-stone-900'
                }`}
                placeholder="0.0"
              />
              <span className="absolute right-3 top-3.5 sm:top-3 text-xs font-bold text-stone-400">
                Litres ({settings.unite})
              </span>
            </div>

            {/* Quick volume chips for mobile touch convenience */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[50, 100, 250, 500].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQuantite(String(val))}
                  className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-stone-100 hover:bg-amber-50 hover:text-amber-800 border border-stone-200 transition cursor-pointer active:scale-95"
                >
                  {val} L
                </button>
              ))}
              {soldeClientDansCuve > 0 && (
                <button
                  type="button"
                  onClick={() => setQuantite(String(Math.floor(soldeClientDansCuve * 10) / 10))}
                  className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-300 transition cursor-pointer active:scale-95"
                >
                  Tout retirer ({soldeClientDansCuve} L)
                </button>
              )}
            </div>
          </div>

          {/* Motif */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Motif du Retrait / Livraison
            </label>
            <input
              type="text"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="ex: Enlèvement camion citerne, vente bidons 5L, consommation personnelle"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Observations */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Observations complémentaires
            </label>
            <input
              type="text"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="ex: Immatriculation du véhicule, numéro de bon de pesée externe"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
              disabled={isSubmitting || isOverBalance || numQty <= 0 || cuvesWithClientStock.length === 0}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition flex items-center gap-1.5 ${
                isSubmitting || isOverBalance || numQty <= 0 || cuvesWithClientStock.length === 0
                  ? 'bg-stone-400 cursor-not-allowed opacity-70'
                  : 'bg-amber-600 hover:bg-amber-500 active:scale-95 cursor-pointer'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Traitement..." : "Valider la Sortie & Imprimer Bon"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
