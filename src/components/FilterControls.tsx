import React from 'react';
import { Filter, User, Gamepad2, Calendar, RotateCcw } from 'lucide-react';

interface FilterControlsProps {
  patients: string[];
  selectedPatient: string;
  onSelectPatient: (patient: string) => void;
  selectedGame: string;
  onSelectGame: (game: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  onResetFilters: () => void;
  totalFiltered: number;
  totalAvailable: number;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  selectedGame,
  onSelectGame,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onResetFilters,
  totalFiltered,
  totalAvailable,
}) => {
  const isFiltered =
    selectedPatient !== 'all' ||
    selectedGame !== 'all' ||
    startDate !== '' ||
    endDate !== '';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Title & Filter Count */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Filtros Clínicos
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            ({totalFiltered} de {totalAvailable} sesiones)
          </span>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 flex-1 lg:max-w-4xl">
          {/* 1. Paciente */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800 text-xs">
            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedPatient}
              onChange={(e) => onSelectPatient(e.target.value)}
              className="w-full bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos los Pacientes</option>
              {patients.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Juego */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800 text-xs">
            <Gamepad2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedGame}
              onChange={(e) => onSelectGame(e.target.value)}
              className="w-full bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos los Juegos</option>
              <option value="mario">Super Mario</option>
              <option value="car">Car (Carrera)</option>
              <option value="piano">Piano Melódico</option>
            </select>
          </div>

          {/* 3. Fecha Desde */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800 text-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 text-[10px] uppercase">Desde:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>

          {/* 4. Fecha Hasta */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800 text-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 text-[10px] uppercase">Hasta:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Reset Filters button */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Restablecer todos los filtros"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Limpiar</span>
          </button>
        )}
      </div>
    </div>
  );
};
