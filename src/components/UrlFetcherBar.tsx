import React, { useState } from 'react';
import { Globe, RefreshCw, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface UrlFetcherBarProps {
  url: string;
  onUrlChange: (newUrl: string) => void;
  onFetch: (targetUrl?: string) => void;
  onLoadSampleData: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  lastSuccessTime: Date | null;
  isUsingSampleData: boolean;
}

export const UrlFetcherBar: React.FC<UrlFetcherBarProps> = ({
  url,
  onUrlChange,
  onFetch,
  onLoadSampleData,
  isLoading,
  errorMessage,
  lastSuccessTime,
  isUsingSampleData,
}) => {
  const [inputVal, setInputVal] = useState(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onUrlChange(inputVal.trim());
      onFetch(inputVal.trim());
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Label icon */}
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 shrink-0">
          <Globe className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">
            URL de Datos (GET):
          </span>
        </div>

        {/* Input */}
        <div className="relative flex-1">
          <input
            type="url"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="https://script.google.com/macros/s/XXXX/exec?t=CLAVE o endpoint REST..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="submit"
            disabled={isLoading || !inputVal.trim()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-xs font-semibold text-white hover:bg-teal-500 disabled:opacity-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          <button
            type="button"
            onClick={onLoadSampleData}
            title="Cargar datos de prueba de rehabilitación"
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden sm:inline">Datos Demo</span>
          </button>
        </div>
      </form>

      {/* Status or Error Banner */}
      {errorMessage ? (
        <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Error al consultar el endpoint: </span>
            <span>{errorMessage}</span>
          </div>
        </div>
      ) : lastSuccessTime ? (
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>
              {isUsingSampleData
                ? 'Mostrando datos de demostración clínicos'
                : 'Conectado al endpoint remoto (GET exitoso sin cabeceras)'}
            </span>
          </span>
          <span className="font-mono">
            Última actualización: {lastSuccessTime.toLocaleTimeString('es-ES')}
          </span>
        </div>
      ) : null}
    </div>
  );
};
