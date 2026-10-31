import React from 'react';
import { SessionItem } from '../types/rehab';
import { getFailedThresholds, formatReadableDateTime } from '../utils/rehabUtils';
import { AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';

interface ThresholdAlertProps {
  lastSession?: SessionItem;
}

export const ThresholdAlert: React.FC<ThresholdAlertProps> = ({ lastSession }) => {
  if (!lastSession) return null;

  const failedThresholds = getFailedThresholds(lastSession);

  if (failedThresholds.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-300/80 bg-emerald-50/80 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30 text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
              Metas alcanzadas en la última sesión ({formatReadableDateTime(lastSession.d)})
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
              Todos los dedos cumplieron o superaron sus umbrales angulares programados para el paciente {lastSession.paciente}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-red-500 bg-red-50/95 p-4 sm:p-5 dark:border-red-600 dark:bg-red-950/40 text-slate-900 dark:text-slate-100 shadow-sm animate-in fade-in">
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-md">
          <AlertOctagon className="h-6 w-6" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-red-950 dark:text-red-100">
                Alerta de Umbral: {failedThresholds.length} {failedThresholds.length === 1 ? 'dedo no alcanzó' : 'dedos no alcanzaron'} su umbral en la última sesión
              </h3>
              <span className="bg-red-600 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-full tracking-wider shadow-2xs">
                Atención Requerida
              </span>
            </div>
            <span className="text-xs font-mono text-red-800 dark:text-red-300">
              {formatReadableDateTime(lastSession.d)} · {lastSession.paciente}
            </span>
          </div>

          <p className="text-xs text-red-900/90 dark:text-red-200 mt-1">
            En la sesión más reciente del juego <strong className="uppercase">{lastSession.g || 'mario'}</strong> (Nivel {lastSession.lv}), los siguientes dedos quedaron por debajo del arco de movimiento objetivo:
          </p>

          {/* List of failed fingers */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {failedThresholds.map((item) => (
              <div
                key={item.finger}
                className="rounded-lg bg-white/95 dark:bg-slate-900/90 p-3 border border-red-200 dark:border-red-900/60 shadow-xs flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      Dedo {item.fingerName}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Logrado: <strong className="text-red-600 dark:text-red-400">{item.actual}°</strong> / Umbral: {item.threshold}°
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/60 px-2 py-1 rounded-md text-[11px]">
                    -{item.deficit}° déficit
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-[11px] text-red-900/80 dark:text-red-300 bg-red-100/60 dark:bg-red-900/30 p-2.5 rounded-lg border border-red-200/60 dark:border-red-900/40">
            <strong>Sugerencia Kinésica:</strong> Ajustar la posición del sensor flexor del guante o programar ejercicios pasivos asistidos con masilla terapéutica para recuperar el arco de flexión antes del siguiente nivel de videojuego.
          </div>
        </div>
      </div>
    </div>
  );
};
