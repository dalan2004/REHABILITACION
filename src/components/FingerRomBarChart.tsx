import React, { useState } from 'react';
import { FINGERS, FingerKey, SessionItem } from '../types/rehab';
import { BarChart3, Target } from 'lucide-react';

interface FingerRomBarChartProps {
  lastSession?: SessionItem;
  sessions: SessionItem[];
}

export const FingerRomBarChart: React.FC<FingerRomBarChartProps> = ({
  lastSession,
  sessions,
}) => {
  const [hoveredBar, setHoveredBar] = useState<{
    fingerKey: FingerKey;
    fingerName: string;
    type: 'last' | 'avg';
    value: number;
    threshold?: number;
  } | null>(null);

  if (!lastSession || sessions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        No hay datos de sesiones disponibles para trazar la comparativa de rango articular.
      </div>
    );
  }

  // Calcular promedios por dedo de las sesiones filtradas
  const averages: Record<FingerKey, number> = {
    p: 0,
    i: 0,
    m: 0,
    a: 0,
    k: 0,
  };

  FINGERS.forEach((f) => {
    const sum = sessions.reduce((acc, s) => acc + (Number(s.max[f.key]) || 0), 0);
    averages[f.key] = Number((sum / sessions.length).toFixed(1));
  });

  // Dimensiones del gráfico SVG
  const width = 640;
  const height = 300;
  const padding = { top: 35, right: 30, bottom: 50, left: 45 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxAngle = 90; // La meta es 90°

  const getY = (val: number) => {
    const clamped = Math.min(maxAngle, Math.max(0, val));
    return padding.top + innerHeight - (clamped / maxAngle) * innerHeight;
  };

  const groupWidth = innerWidth / FINGERS.length;
  const barWidth = Math.min(30, groupWidth * 0.34);
  const barGap = 6;

  // Ticks para el eje Y (0, 30, 60, 90)
  const yTicks = [0, 30, 60, 90];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            Rango de Movimiento por Dedo
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-slate-800 dark:bg-slate-200 inline-block" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Última sesión</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-slate-400/60 dark:bg-slate-600 inline-block border border-dashed border-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Promedio ({sessions.length})</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-rose-500 inline-block" />
            <span>Meta 90°</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative mt-3 w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
          {/* Background grid lines */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            const is90 = tick === 90;
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={is90 ? '#E11D48' : 'currentColor'}
                  strokeDasharray={is90 ? '4 3' : '2 2'}
                  strokeWidth={is90 ? 1.5 : 1}
                  strokeOpacity={is90 ? 0.8 : 0.15}
                  className={is90 ? '' : 'text-slate-400 dark:text-slate-600'}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className={`text-[11px] font-mono tabular-nums ${
                    is90
                      ? 'fill-rose-600 dark:fill-rose-400 font-bold'
                      : 'fill-slate-400 dark:fill-slate-500'
                  }`}
                >
                  {tick}°
                </text>
              </g>
            );
          })}

          {/* Goal 90° Text Indicator */}
          <text
            x={width - padding.right}
            y={getY(90) - 6}
            textAnchor="end"
            className="text-[10px] font-bold fill-rose-600 dark:fill-rose-400"
          >
            LÍNEA META 90°
          </text>

          {/* Finger Bars */}
          {FINGERS.map((finger, idx) => {
            const groupX = padding.left + idx * groupWidth;
            const centerX = groupX + groupWidth / 2;

            const lastVal = Number(lastSession.max[finger.key]) || 0;
            const avgVal = averages[finger.key];
            const threshold = Number(lastSession.th[finger.key]) || 0;

            const xLast = centerX - barWidth - barGap / 2;
            const xAvg = centerX + barGap / 2;

            const yLast = getY(lastVal);
            const hLast = padding.top + innerHeight - yLast;

            const yAvg = getY(avgVal);
            const hAvg = padding.top + innerHeight - yAvg;

            const yTh = getY(threshold);

            return (
              <g key={finger.key}>
                {/* Background column hover strip */}
                <rect
                  x={groupX + 4}
                  y={padding.top}
                  width={groupWidth - 8}
                  height={innerHeight}
                  fill={finger.color}
                  fillOpacity="0.04"
                  rx={6}
                />

                {/* Bar 1: Última Sesión */}
                <rect
                  x={xLast}
                  y={yLast}
                  width={barWidth}
                  height={Math.max(2, hLast)}
                  rx={4}
                  fill={finger.color}
                  className="transition-all hover:opacity-90 cursor-pointer"
                  onMouseEnter={() =>
                    setHoveredBar({
                      fingerKey: finger.key,
                      fingerName: finger.nombre,
                      type: 'last',
                      value: lastVal,
                      threshold,
                    })
                  }
                  onMouseLeave={() => setHoveredBar(null)}
                />
                {/* Last value label on top */}
                <text
                  x={xLast + barWidth / 2}
                  y={yLast - 5}
                  textAnchor="middle"
                  className="text-[10px] font-mono font-bold fill-slate-800 dark:fill-slate-100"
                >
                  {lastVal}°
                </text>

                {/* Bar 2: Promedio */}
                <rect
                  x={xAvg}
                  y={yAvg}
                  width={barWidth}
                  height={Math.max(2, hAvg)}
                  rx={4}
                  fill={finger.color}
                  fillOpacity="0.38"
                  stroke={finger.color}
                  strokeWidth={1}
                  className="transition-all hover:opacity-90 cursor-pointer"
                  onMouseEnter={() =>
                    setHoveredBar({
                      fingerKey: finger.key,
                      fingerName: finger.nombre,
                      type: 'avg',
                      value: avgVal,
                      threshold,
                    })
                  }
                  onMouseLeave={() => setHoveredBar(null)}
                />
                {/* Avg value label on top */}
                <text
                  x={xAvg + barWidth / 2}
                  y={yAvg - 5}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-slate-500 dark:fill-slate-400"
                >
                  {avgVal}°
                </text>

                {/* Threshold dash on Last Session Bar */}
                <line
                  x1={xLast - 2}
                  y1={yTh}
                  x2={xLast + barWidth + 2}
                  y2={yTh}
                  stroke="#ffffff"
                  strokeWidth={2}
                  className="pointer-events-none drop-shadow-sm"
                />

                {/* X Axis Label */}
                <text
                  x={centerX}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-slate-800 dark:fill-slate-200"
                >
                  {finger.nombre}
                </text>
                <text
                  x={centerX}
                  y={height - padding.bottom + 32}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500"
                >
                  Umb: {threshold}°
                </text>
              </g>
            );
          })}

          {/* Interactive Tooltip */}
          {hoveredBar && (
            <g transform={`translate(${width / 2 - 90}, ${padding.top - 20})`}>
              <rect
                width={180}
                height={48}
                rx={6}
                className="fill-slate-900/95 stroke-slate-700 dark:fill-slate-950/95 dark:stroke-slate-800"
                strokeWidth={1}
              />
              <text x={90} y={18} textAnchor="middle" className="fill-white text-[11px] font-semibold">
                {hoveredBar.fingerName} ({hoveredBar.type === 'last' ? 'Última Sesión' : 'Promedio Histórico'})
              </text>
              <text x={90} y={34} textAnchor="middle" className="fill-slate-300 text-[11px] font-mono">
                Valor: <tspan className="font-bold fill-teal-400">{hoveredBar.value}°</tspan> / Meta: 90°
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Quick Finger Cards below chart */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-5 gap-1.5 sm:gap-2 text-center">
        {FINGERS.map((f) => {
          const last = Number(lastSession.max[f.key]) || 0;
          const th = Number(lastSession.th[f.key]) || 0;
          const reached = last >= th;

          return (
            <div
              key={f.key}
              className="rounded-lg p-2 border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div className="flex items-center justify-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: f.color }} />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  {f.nombreCorto}
                </span>
              </div>
              <div className="mt-1 font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                {last}°
              </div>
              <div
                className={`text-[9px] font-medium mt-0.5 ${
                  reached ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400 font-bold'
                }`}
              >
                {reached ? `≥ ${th}° OK` : `< ${th}° ALERTA`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
