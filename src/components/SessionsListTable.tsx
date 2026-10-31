import React, { useState } from 'react';
import { FINGERS, SessionItem } from '../types/rehab';
import {
  calculateTotalReps,
  formatDuration,
  formatReadableDateTime,
} from '../utils/rehabUtils';
import { Gamepad2, ChevronDown, ChevronUp, Radio, Laptop, Trophy, Clock } from 'lucide-react';

interface SessionsListTableProps {
  sessions: SessionItem[];
}

export const SessionsListTable: React.FC<SessionsListTableProps> = ({ sessions }) => {
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  // Ordenar de la más reciente a la más antigua
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.d).getTime() - new Date(a.d).getTime()
  );

  const toggleExpand = (id: string | number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getGameLabel = (g?: string) => {
    const clean = (g || 'mario').toLowerCase();
    if (clean === 'car') return { label: 'Car / Carrera', color: 'text-amber-600 dark:text-amber-400' };
    if (clean === 'piano') return { label: 'Piano Melódico', color: 'text-purple-600 dark:text-purple-400' };
    return { label: 'Super Mario', color: 'text-rose-600 dark:text-rose-400' };
  };

  const getResultBadge = (res?: string) => {
    const clean = (res || 'win').toLowerCase();
    if (clean === 'win') {
      return (
        <span className="inline-flex items-center text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          Victoria (Win)
        </span>
      );
    }
    if (clean === 'lose') {
      return (
        <span className="inline-flex items-center text-xs font-semibold text-rose-700 dark:text-rose-400">
          Derrota (Lose)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
        Salida (Quit)
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            Tabla de Sesiones Kinésicas
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ordenadas de la más reciente a la más antigua ({sortedSessions.length} registros)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4 whitespace-nowrap">Fecha</th>
              <th className="py-3 px-3 whitespace-nowrap">Juego</th>
              <th className="py-3 px-3 whitespace-nowrap text-center">Nivel</th>
              <th className="py-3 px-3 whitespace-nowrap">Resultado</th>
              <th className="py-3 px-3 whitespace-nowrap text-right">Puntos</th>
              <th className="py-3 px-3 whitespace-nowrap text-center">Estrellas</th>
              <th className="py-3 px-3 whitespace-nowrap text-right">Duración</th>
              <th className="py-3 px-4 whitespace-nowrap">Origen</th>
              <th className="py-3 px-3 whitespace-nowrap text-center">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {sortedSessions.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  No hay sesiones para mostrar con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              sortedSessions.map((s, idx) => {
                const isExpanded = expandedId === s.id;
                const gameInfo = getGameLabel(s.g);
                const isSim = Boolean(s.sim);

                return (
                  <React.Fragment key={`${s.id}-${idx}`}>
                    <tr
                      onClick={() => toggleExpand(s.id)}
                      className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      {/* Fecha */}
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {formatReadableDateTime(s.d)}
                      </td>

                      {/* Juego */}
                      <td className="py-3 px-3 whitespace-nowrap font-medium">
                        <span className={gameInfo.color}>{gameInfo.label}</span>
                      </td>

                      {/* Nivel */}
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-700 dark:text-slate-300 text-center whitespace-nowrap">
                        Nivel {s.lv}
                      </td>

                      {/* Resultado */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getResultBadge(s.res)}
                      </td>

                      {/* Puntos */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {s.score.toLocaleString()}
                      </td>

                      {/* Estrellas */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="text-amber-500 font-mono text-sm tracking-widest">
                          {'★'.repeat(Math.min(3, Math.max(1, s.stars)))}
                        </span>
                      </td>

                      {/* Duración */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDuration(s.dur)}
                      </td>

                      {/* Origen */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isSim ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                            <Laptop className="h-3 w-3" />
                            <span>Prueba (sin guante)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 dark:text-teal-400">
                            <Radio className="h-3 w-3" />
                            <span>Guante</span>
                          </span>
                        )}
                      </td>

                      {/* Expand Toggle */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          className="p-1 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400"
                          aria-label="Ver detalles"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable detail row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/70 dark:bg-slate-800/30">
                        <td colSpan={9} className="p-4 border-t border-slate-100 dark:border-slate-800">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            {/* Rango de movimiento alcanzado vs umbral */}
                            <div className="rounded-lg bg-white p-3 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                              <span className="font-bold text-slate-900 dark:text-slate-100 block mb-2">
                                Rango por Dedo (Max / Umbral th)
                              </span>
                              <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
                                {FINGERS.map((f) => {
                                  const val = Number(s.max[f.key]) || 0;
                                  const th = Number(s.th[f.key]) || 0;
                                  const ok = val >= th;
                                  return (
                                    <div
                                      key={f.key}
                                      className="p-1 rounded-md border"
                                      style={{
                                        borderColor: `${f.color}40`,
                                        backgroundColor: f.colorBg,
                                      }}
                                    >
                                      <span className="text-[10px] font-bold block" style={{ color: f.color }}>
                                        {f.nombreCorto.slice(0, 3)}
                                      </span>
                                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                                        {val}°
                                      </span>
                                      <span className={`text-[9px] block ${ok ? 'text-slate-500' : 'text-rose-600 font-bold'}`}>
                                        th:{th}°
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Desglose de repeticiones */}
                            <div className="rounded-lg bg-white p-3 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                              <span className="font-bold text-slate-900 dark:text-slate-100 block mb-2">
                                Repeticiones Motoras (Total: {calculateTotalReps(s.reps)})
                              </span>
                              <div className="grid grid-cols-3 gap-2 font-mono text-slate-600 dark:text-slate-300">
                                <div>Izq (l): <strong className="text-slate-900 dark:text-slate-100">{s.reps.l || 0}</strong></div>
                                <div>Salto (j): <strong className="text-slate-900 dark:text-slate-100">{s.reps.j || 0}</strong></div>
                                <div>Der (r): <strong className="text-slate-900 dark:text-slate-100">{s.reps.r || 0}</strong></div>
                                <div>Abajo (d): <strong className="text-slate-900 dark:text-slate-100">{s.reps.d || 0}</strong></div>
                                <div>Escudo (s): <strong className="text-slate-900 dark:text-slate-100">{s.reps.s || 0}</strong></div>
                                <div>Fuego (f): <strong className="text-slate-900 dark:text-slate-100">{s.reps.f || 0}</strong></div>
                              </div>
                            </div>

                            {/* Fuerza de palma y telemetría gamificada */}
                            <div className="rounded-lg bg-white p-3 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300 space-y-1">
                              <span className="font-bold text-slate-900 dark:text-slate-100 block mb-2 font-sans">
                                Dinamometría y Telemetría
                              </span>
                              <div className="flex justify-between">
                                <span>Fuerza palma máx (fm):</span>
                                <strong className="text-teal-600 dark:text-teal-400">{s.fm}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span>Fuerza promedio (fa):</span>
                                <strong>{s.fa}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span>Agarres (grips):</span>
                                <strong>{s.grips}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span>Monedas / Enemigos:</span>
                                <span>{s.coins || 0} / {s.kills || 0}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
