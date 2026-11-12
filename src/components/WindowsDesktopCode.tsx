import React, { useState } from 'react';
import { 
  Monitor, 
  Download, 
  Terminal, 
  FileCode, 
  FolderDown, 
  Check, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Package,
  Cpu
} from 'lucide-react';

export const WindowsDesktopCode: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const files = [
    {
      name: "main.py",
      desc: "Application principale PySide6 (GUI Qt, dashboards, formulaires et impression)",
      path: "/desktop_app/main.py"
    },
    {
      name: "database.py",
      desc: "Moteur SQLite avec PRAGMA foreign_keys, transactions atomiques et audit",
      path: "/desktop_app/database.py"
    },
    {
      name: "receipt_printer.py",
      desc: "Générateur HTML / QPrinter pour impression de bons officiels A4",
      path: "/desktop_app/receipt_printer.py"
    },
    {
      name: "test_stock.py",
      desc: "Suite complète de 10 tests unitaires obligatoires (unittest)",
      path: "/desktop_app/test_stock.py"
    },
    {
      name: "build_exe.bat",
      desc: "Script automatique de génération de l'exécutable Windows 11 (.exe)",
      path: "/desktop_app/build_exe.bat"
    },
    {
      name: "huilerie_jemai.spec",
      desc: "Fichier de configuration PyInstaller pour l'exécutable autonome",
      path: "/desktop_app/huilerie_jemai.spec"
    },
    {
      name: "installer_setup.iss",
      desc: "Script Inno Setup pour créer l'installateur Windows 11 (Setup_Huilerie_Jemai.exe)",
      path: "/desktop_app/installer_setup.iss"
    },
    {
      name: "lancer_application.bat",
      desc: "Lanceur rapide 1-clic pour Windows sans ouvrir de console",
      path: "/desktop_app/lancer_application.bat"
    },
    {
      name: "requirements.txt",
      desc: "Dépendances Python gratuites (PySide6, pyinstaller)",
      path: "/desktop_app/requirements.txt"
    },
    {
      name: "README_WINDOWS11.md",
      desc: "Guide pas à pas illustré en français pour les utilisateurs non-programmeurs",
      path: "/desktop_app/README_WINDOWS11.md"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Hero Banner Windows 11 */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-stone-800">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Monitor className="w-3.5 h-3.5" />
              <span>Application de Bureau Windows 11 &bull; Python & PySide6</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Code Source & Installateur Windows 11
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              L'intégralité du code source Python est fournie dans le répertoire <code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-300">/desktop_app</code>. Vous pouvez lancer le logiciel sous Windows 11 ou générer un exécutable <strong className="text-white">.exe</strong> ou installateur complet en un clic.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="bg-emerald-950/80 border border-emerald-700/60 p-4 rounded-xl text-xs space-y-1">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Base SQLite 100% Autonome</span>
              </div>
              <p className="text-stone-300 text-[11px]">
                Zéro serveur distant, données privées hébergées sur votre PC.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Pas-à-Pas pour Utilisateur non-programmeur */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-5">
        <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-700" />
          Instructions Très Simples pour Windows 11
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Étape 1 */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="font-bold text-stone-900 text-sm">Installer Python</h4>
            <p className="text-stone-600">
              Téléchargez Python depuis <strong>python.org</strong>. Cochez impérativement la case <em>"Add python.exe to PATH"</em> lors de l'installation.
            </p>
          </div>

          {/* Étape 2 */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="font-bold text-stone-900 text-sm">Lancer le Logiciel</h4>
            <p className="text-stone-600">
              Double-cliquez simplement sur <strong>lancer_application.bat</strong>. L'interface PySide6 pour Huilerie Jemai s'ouvrira immédiatement.
            </p>
          </div>

          {/* Étape 3 */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="font-bold text-stone-900 text-sm">Générer le .EXE</h4>
            <p className="text-stone-600">
              Double-cliquez sur <strong>build_exe.bat</strong>. PyInstaller testera et compilera votre fichier <code className="bg-stone-200 px-1 rounded">HuilerieJemai.exe</code> autonome !
            </p>
          </div>

        </div>

        {/* Commandes rapides à copier */}
        <div className="bg-stone-900 text-stone-200 rounded-xl p-4 font-mono text-xs space-y-3">
          <div className="flex justify-between items-center text-stone-400 border-b border-stone-800 pb-2">
            <span>Commandes d'installation rapide (Invite de commande Windows) :</span>
            <button
              onClick={() => copyToClipboard("pip install -r requirements.txt\npython main.py", "cmd1")}
              className="text-stone-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copiedCmd === 'cmd1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd === 'cmd1' ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
          <pre className="text-emerald-400 leading-relaxed overflow-x-auto">
{`cd desktop_app
pip install -r requirements.txt
python -m unittest discover -s . -p "test_*.py"
python main.py`}
          </pre>
        </div>
      </div>

      {/* Explorateur des Fichiers Fournis */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-700" />
              Fichiers du Projet Python sous <code className="text-stone-700 font-mono">/desktop_app</code>
            </h3>
            <p className="text-xs text-stone-500">
              Tous les fichiers sont complets, testés et prêts pour Windows 11
            </p>
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {files.map((file, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between hover:bg-stone-50 px-2 rounded-lg text-xs">
              <div className="flex items-start gap-3">
                <FileCode className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <span className="font-mono font-bold text-stone-900">{file.name}</span>
                  <p className="text-stone-500 text-[11px] mt-0.5">{file.desc}</p>
                </div>
              </div>

              <span className="font-mono text-[11px] text-stone-400 bg-stone-100 px-2 py-1 rounded">
                {file.path}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
