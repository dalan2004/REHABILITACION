import React, { useState, useEffect, useRef } from 'react';
import {
  BUNDLED_GAME_URL,
  ASSET_GAME_URL,
  LOCAL_FILE_URL,
  getMarioGameUrl,
  saveMarioGameUrl,
} from '../utils/gameLauncher';
import {
  Gamepad2,
  ExternalLink,
  Copy,
  Check,
  X,
  AlertTriangle,
  Play,
  Maximize2,
  RotateCcw,
  Sparkles,
  Download,
  Laptop,
  Flame,
  Shield,
  Layers,
} from 'lucide-react';
import { SessionItem } from '../types/rehab';

interface GameLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  onSessionSaved?: (session: SessionItem) => void;
}

export const GameLauncherModal: React.FC<GameLauncherModalProps> = ({
  isOpen,
  onClose,
  patientName,
  onSessionSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'embedded' | 'tab' | 'local'>('embedded');
  const [gameUrl, setGameUrl] = useState(getMarioGameUrl());
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLocal, setCopiedLocal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [lastSavedNotice, setLastSavedNotice] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync patient name to localStorage so the game picks it up
  useEffect(() => {
    if (patientName && typeof window !== 'undefined') {
      try {
        localStorage.setItem('mr9n', patientName);
      } catch (e) {
        console.error('Error guardando paciente para el juego', e);
      }
    }
  }, [patientName, isOpen]);

  // Listen for session completion events from Mario Rehab
  useEffect(() => {
    const handleGameMessage = (event: MessageEvent) => {
      if (event.data?.type === 'MARIO_REHAB_SESSION_SAVED' && event.data.session) {
        const session = event.data.session;
        setLastSavedNotice(
          `¡Sesión completada en Nivel ${session.lv} (${session.res === 'win' ? 'Ganó' : 'Terminada'}) con ${session.score} pts!`
        );
        if (onSessionSaved) {
          onSessionSaved(session);
        }
      }
    };

    window.addEventListener('message', handleGameMessage);
    return () => window.removeEventListener('message', handleGameMessage);
  }, [onSessionSaved]);

  if (!isOpen) return null;

  const handleCopyUrl = (textToCopy: string, setStatus: (v: boolean) => void) => {
    navigator.clipboard.writeText(textToCopy);
    setStatus(true);
    setTimeout(() => setStatus(false), 2000);
  };

  const handleSaveCustomUrl = () => {
    saveMarioGameUrl(gameUrl);
    setIsEditingUrl(false);
  };

  const handleResetGameUrl = () => {
    setGameUrl(BUNDLED_GAME_URL);
    saveMarioGameUrl(BUNDLED_GAME_URL);
    setIsEditingUrl(false);
  };

  const handleReloadIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleOpenInNewWindow = () => {
    window.open(BUNDLED_GAME_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div
        ref={containerRef}
        className={`w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col transition-all overflow-hidden ${
          isFullscreen ? 'h-screen max-w-none rounded-none border-0' : 'max-h-[92vh]'
        }`}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-purple-950 shadow-md font-bold">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-wide text-white">
                  MARIO REHAB v10
                </h3>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Integrado
                </span>
              </div>
              <span className="text-[11px] text-purple-200 block">
                {patientName ? `Paciente activo: ${patientName}` : 'Guante sensorizado: USB, WiFi, Bluetooth o Teclado'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFullscreen}
              className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
              title="Cerrar ventana"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs & Quick Controls */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-950 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('embedded')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'embedded'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Jugar Aquí</span>
            </button>

            <button
              onClick={() => setActiveTab('tab')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tab'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Nueva Pestaña</span>
            </button>

            <button
              onClick={() => setActiveTab('local')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'local'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              <span>Archivo Local (file://)</span>
            </button>
          </div>

          {activeTab === 'embedded' && (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleReloadIframe}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors font-medium text-[11px]"
                title="Reiniciar juego"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reiniciar</span>
              </button>
              <button
                onClick={handleOpenInNewWindow}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 font-medium text-[11px] transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Abrir fuera</span>
              </button>
            </div>
          )}
        </div>

        {/* Live session notification banner */}
        {lastSavedNotice && (
          <div className="bg-emerald-500 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>{lastSavedNotice}</span>
            </div>
            <button
              onClick={() => setLastSavedNotice(null)}
              className="text-emerald-100 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 text-slate-100">
          {/* TAB 1: EMBEDDED GAME */}
          {activeTab === 'embedded' && (
            <div className="flex-1 flex flex-col relative w-full h-full min-h-[460px]">
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={BUNDLED_GAME_URL}
                title="Super Mario Rehab Game"
                className="w-full flex-1 border-0 bg-slate-950"
                allow="autoplay; fullscreen; serial; bluetooth"
              />

              {/* Game bottom helper controls bar */}
              <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-amber-400" />
                    Teclas:
                  </span>
                  <span>←→ / A-D: Mover</span>
                  <span>Espacio / W: Salto</span>
                  <span>Z: Correr</span>
                  <span>X: Escudo</span>
                  <span>F: Fuego</span>
                  <span>P: Pausa</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Shield className="h-3.5 w-3.5 text-purple-400" />
                  <span>Soporta Guante USB / Bluetooth / WiFi</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPEN IN NEW TAB */}
          {activeTab === 'tab' && (
            <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto my-auto">
              <div className="h-16 w-16 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-lg">
                <Gamepad2 className="h-9 w-9" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">
                  Jugar Mario Rehab en Pestaña Completa
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  El juego está cargado directamente en tu servidor local en{' '}
                  <code className="text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded font-mono">
                    {BUNDLED_GAME_URL}
                  </code>
                  . Puedes abrirlo sin restricciones de seguridad de Windows ni bloqueos de navegador.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={handleOpenInNewWindow}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Abrir en Nueva Pestaña</span>
                  <ExternalLink className="h-4 w-4" />
                </button>

                <a
                  href={BUNDLED_GAME_URL}
                  download="mario_rehab_v10.html"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar HTML</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: LOCAL FILE (FILE:///) */}
          {activeTab === 'local' && (
            <div className="p-6 sm:p-8 space-y-5 max-w-2xl mx-auto my-auto">
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-amber-300 text-sm">
                      Enlace a tu archivo local en la PC
                    </h5>
                    <p className="text-xs text-amber-200/80 mt-1">
                      Por motivos de seguridad, los navegadores (Chrome, Edge) no permiten que una página web abra directamente enlaces que inicien con <code className="bg-amber-950/70 px-1 rounded text-amber-300 font-mono">file:///</code> sin intervención manual.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    Ruta local configurada:
                  </span>
                  <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
                    <span className="flex-1 truncate text-amber-300">{LOCAL_FILE_URL}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(LOCAL_FILE_URL, setCopiedLocal)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shrink-0 transition-colors text-xs"
                    >
                      {copiedLocal ? <Check className="h-3.5 w-3.5 text-slate-950" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedLocal ? '¡Copiado!' : 'Copiar Ruta'}</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    💡 <b>Instrucción rápida:</b> Copia la ruta y pégala en la barra de direcciones de tu navegador, o presiona <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-200">Win + R</kbd> en Windows y pega la dirección.
                  </span>
                </div>
              </div>

              {/* Personalizar URL */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-purple-400" />
                    Configuración de URL del juego
                  </span>
                  <button
                    onClick={handleResetGameUrl}
                    className="text-xs text-purple-400 hover:text-purple-300 hover:underline"
                  >
                    Restablecer al integrado
                  </button>
                </div>

                {isEditingUrl ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={gameUrl}
                      onChange={(e) => setGameUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                      placeholder="file:///... o http://localhost:8080/..."
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={handleSaveCustomUrl}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 text-xs transition-colors"
                      >
                        Guardar cambios
                      </button>
                      <button
                        onClick={() => setIsEditingUrl(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 text-xs hover:bg-slate-800"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="truncate max-w-md font-mono">{gameUrl}</span>
                    <button
                      onClick={() => setIsEditingUrl(true)}
                      className="text-purple-400 hover:underline font-semibold ml-2 shrink-0"
                    >
                      Editar ruta
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0 text-xs">
          <div className="text-slate-500 dark:text-slate-400 text-[11px]">
            Sesiones sincronizadas automáticamente con el historial clínico.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white font-bold transition-colors"
          >
            Cerrar Lanzador
          </button>
        </div>
      </div>
    </div>
  );
};
