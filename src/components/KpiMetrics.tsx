import React from 'react';
import { FINGERS, FingerKey, SessionItem } from '../types/rehab';
import { calculateTotalReps } from '../utils/rehabUtils';
import { Activity, Dumbbell, Compass, Award } from 'lucide-react';

interface KpiMetricsProps {
  sessions: SessionItem[];
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({ sessions }) => {
  const totalSessions = sessions.length;

  const totalReps = sessions.reduce(
    (acc, s) => acc + calculateTotalReps(s.reps),
    0
  );

  // Máximo por dedo a lo largo de las sesiones filtradas
  const maxPerFinger: Record<FingerKey, number> = {
    p: 0,
    i: 0,
    m: 0,
    a: 0,
    k: 0,
  };

  FINGERS.forEach((f) => {
    const vals = sessions.map((s) => Number(s.max[f.key]) || 0);
    maxPerFinger[f.key] = vals.length > 0 ? Math.max(...vals) : 0;
  });

  // Fuerza máxima de palma (fm)
  const fmVals = sessions.map((s) => Number(s.fm) || 0);
  const maxPalmForce = fmVals.length > 0 ? Math.max(...fmVals) : 0;

  // Fuerza promedio de palma
  const faSum = sessions.reduce((acc, s) => acc + (Number(s.fa) || 0), 0);
  const avgPalmForce = totalSessions > 0 ? Math.round(faSum / totalSessions) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total de Sesiones */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total de Sesiones
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {totalSessions}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            registradas
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          En el rango de fechas seleccionado
        </div>
      </div>

      {/* 2. Total de Repeticiones */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Repeticiones
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
            {totalReps.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            movimientos
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          Suma de flexiones, saltos y agarres
        </div>
      </div>

      {/* 3. Rango de Movimiento Máximo por Dedo */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            ROM Máximo por Dedo
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
            <Compass className="h-4 w-4" />
          </div>
        </div>
        {/* Badges for each finger with distinct color */}
        <div className="mt-2.5 flex items-center justify-between gap-1">
          {FINGERS.map((f) => (
            <div
              key={f.key}
              className="flex-1 text-center py-1 px-1 rounded-md border"
              style={{
                borderColor: `${f.color}40`,
                backgroundColor: f.colorBg,
              }}
            >
              <span className="block text-[10px] font-bold" style={{ color: f.color }}>
                {f.nombreCorto.slice(0, 3)}
              </span>
              <span className="block text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                {maxPerFinger[f.key]}°
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 text-center">
          Meta funcional: 90° de flexión
        </div>
      </div>

      {/* 4. Fuerza Máxima de Palma */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Fuerza Máx. Palma
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Dumbbell className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {maxPalmForce}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            unidades (fm)
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Promedio sostenido:</span>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
            {avgPalmForce} u. (fa)
          </span>
        </div>
      </div>
    </div>
  );
};
