import React, { useState } from 'react';
import { SessionItem } from '../types/rehab';
import { calculateAverageRom, calculateTotalReps, formatReadableDateTime } from '../utils/rehabUtils';
import { TrendingUp, Layers } from 'lucide-react';

interface EvolutionLineChartProps {
  sessions: SessionItem[];
}

export const EvolutionLineChart: React.FC<EvolutionLineChartProps> = ({ sessions }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Ordenar cronológicamente (más antiguo al más reciente) para la evolución temporal
  const chronological = [...sessions].sort(
    (a, b) => new Date(a.d).getTime() - new Date(b.d).getTime()
  );

  if (chronological.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        No hay datos suficientes para trazar la evolución temporal.
      </div>
    );
  }

  const width = 640;
  const height = 300;
  const padding = { top: 35, right: 48, bottom: 50, left: 48 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const count = chronological.length;

  const getX = (idx: number) => {
    if (count <= 1) return padding.left + innerWidth / 2;
    return padding.left + (idx / (count - 1)) * innerWidth;
  };

  // Escala para Repeticiones (Eje izquierdo)
  const repsValues = chronological.map((s) => calculateTotalReps(s.reps));
  const maxRepsData = Math.max(...repsValues, 20);
  const maxRepsScale = Math.ceil(maxRepsData * 1.15);

  const getY_Reps = (val: number) => {
    return padding.top + innerHeight - (val / maxRepsScale) * innerHeight;
  };

  // Escala para Rango Medio (Eje derecho: 0 a 90 grados)
  const maxRomScale = 90;
  const getY_Rom = (val: number) => {
    const clamped = Math.min(90, Math.max(0, val));
    return padding.top + innerHeight - (clamped / maxRomScale) * innerHeight;
  };

  const yTicksPct = [0, 0.33, 0.66, 1];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            Evolución en el Tiempo
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-5 rounded-full bg-indigo-500 inline-block" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Repeticiones / sesión</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-5 rounded-full bg-teal-500 inline-block" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Rango medio (° flexión)</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative mt-3 w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
          {/* Horizontal grid lines */}
          {yTicksPct.map((pct, i) => {
            const y = padding.top + innerHeight * (1 - pct);
            const repsLabel = Math.round(maxRepsScale * pct);
            const romLabel = Math.round(maxRomScale * pct);

            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="2 2"
                  strokeOpacity={0.12}
                  className="text-slate-400 dark:text-slate-600"
                />
                {/* Left Y Axis (Reps) */}
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-indigo-600 dark:fill-indigo-400 font-semibold"
                >
                  {repsLabel}
                </text>
                {/* Right Y Axis (ROM Degrees) */}
                <text
                  x={width - padding.right + 8}
                  y={y + 3.5}
                  textAnchor="start"
                  className="text-[10px] font-mono fill-teal-600 dark:fill-teal-400 font-semibold"
                >
                  {romLabel}°
                </text>
              </g>
            );
          })}

          {/* Left Axis Title */}
          <text
            x={padding.left}
            y={padding.top - 12}
            textAnchor="start"
            className="text-[9px] font-bold uppercase fill-indigo-600 dark:fill-indigo-400"
          >
            Reps Totales
          </text>
          {/* Right Axis Title */}
          <text
            x={width - padding.right}
            y={padding.top - 12}
            textAnchor="end"
            className="text-[9px] font-bold uppercase fill-teal-600 dark:fill-teal-400"
          >
            Rango Medio (°)
          </text>

          {/* X Axis Ticks */}
          {chronological.map((session, idx) => {
            const x = getX(idx);
            const isHovered = hoveredIdx === idx;
            const dateShort = session.d.split('T')[0].slice(5);

            return (
              <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(idx)}>
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke="#94A3B8"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                )}
                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  className={`text-[10px] font-mono tabular-nums ${
                    isHovered
                      ? 'fill-slate-900 dark:fill-white font-bold'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {dateShort}
                </text>
                <text
                  x={x}
                  y={height - padding.bottom + 28}
                  textAnchor="middle"
                  className="text-[9px] uppercase font-semibold fill-slate-400 dark:fill-slate-500"
                >
                  S{idx + 1}
                </text>
              </g>
            );
          })}

          {/* LINE 1: Repeticiones (Indigo) */}
          {(() => {
            const points = chronological.map((s, idx) => `${getX(idx)},${getY_Reps(calculateTotalReps(s.reps))}`);
            const pathD = points.reduce((acc, curr, i) => (i === 0 ? `M ${curr}` : `${acc} L ${curr}`), '');
            const areaPoints = [
              `${getX(0)},${padding.top + innerHeight}`,
              ...points,
              `${getX(count - 1)},${padding.top + innerHeight}`,
            ].join(' ');

            return (
              <g>
                <polygon points={areaPoints} fill="#6366F1" fillOpacity={0.08} />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {chronological.map((s, idx) => {
                  const val = calculateTotalReps(s.reps);
                  return (
                    <circle
                      key={idx}
                      cx={getX(idx)}
                      cy={getY_Reps(val)}
                      r={hoveredIdx === idx ? 6 : 4}
                      fill="#6366F1"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredIdx(idx)}
                    />
                  );
                })}
              </g>
            );
          })()}

          {/* LINE 2: Rango Medio (Teal) */}
          {(() => {
            const points = chronological.map((s, idx) => `${getX(idx)},${getY_Rom(calculateAverageRom(s.max))}`);
            const pathD = points.reduce((acc, curr, i) => (i === 0 ? `M ${curr}` : `${acc} L ${curr}`), '');

            return (
              <g>
                <path
                  d={pathD}
                  fill="none"
                  stroke="#14B8A6"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {chronological.map((s, idx) => {
                  const val = calculateAverageRom(s.max);
                  return (
                    <circle
                      key={idx}
                      cx={getX(idx)}
                      cy={getY_Rom(val)}
                      r={hoveredIdx === idx ? 6 : 4}
                      fill="#14B8A6"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredIdx(idx)}
                    />
                  );
                })}
              </g>
            );
          })()}

          {/* Interactive Hover Tooltip */}
          {hoveredIdx !== null && chronological[hoveredIdx] && (
            <g
              transform={`translate(${Math.min(
                width - 180,
                Math.max(padding.left, getX(hoveredIdx) - 90)
              )}, ${padding.top + 8})`}
            >
              <rect
                width={175}
                height={85}
                rx={6}
                className="fill-slate-900/95 stroke-slate-700 shadow-xl dark:fill-slate-950/95 dark:stroke-slate-800"
                strokeWidth={1}
              />
              <text x={10} y={18} className="fill-white text-[11px] font-bold">
                Sesión #{hoveredIdx + 1} ({chronological[hoveredIdx].g || 'mario'})
              </text>
              <text x={10} y={32} className="fill-slate-400 text-[9px] font-mono">
                {formatReadableDateTime(chronological[hoveredIdx].d)}
              </text>
              <text x={10} y={50} className="fill-indigo-400 text-[11px] font-medium">
                Repeticiones:{' '}
                <tspan className="font-mono font-bold fill-white">
                  {calculateTotalReps(chronological[hoveredIdx].reps)}
                </tspan>
              </text>
              <text x={10} y={68} className="fill-teal-400 text-[11px] font-medium">
                Rango Medio:{' '}
                <tspan className="font-mono font-bold fill-white">
                  {calculateAverageRom(chronological[hoveredIdx].max)}°
                </tspan>
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>{chronological.length} sesiones en el período</span>
        <span className="font-mono">
          Evolución global: {calculateAverageRom(chronological[0]?.max)}° →{' '}
          {calculateAverageRom(chronological[chronological.length - 1]?.max)}°
        </span>
      </div>
    </div>
  );
};
