import React, { useState } from 'react';
import { FINGERS, FingerKey, SessionItem } from '../types/rehab';
import { calculateTotalReps, formatDuration, formatReadableDateTime } from '../utils/rehabUtils';
import {
  Trophy,
  Star,
  Gamepad2,
  Sparkles,
  Flame,
  Award,
  ChevronRight,
  User,
  Heart,
  Smile,
  Zap,
  Target,
  CheckCircle2,
  Play,
} from 'lucide-react';

interface PatientModeViewProps {
  sessions: SessionItem[];
  allPatients: string[];
  initialPatient?: string;
  userRole?: 'fisio' | 'paciente';
  onSwitchToClinician?: () => void;
  onOpenGame?: () => void;
}

export const PatientModeView: React.FC<PatientModeViewProps> = ({
  sessions,
  allPatients,
  initialPatient,
  userRole = 'fisio',
  onSwitchToClinician,
  onOpenGame,
}) => {
  // Paciente seleccionado para el modo paciente
  const [activePatient, setActivePatient] = useState<string>(() => {
    if (initialPatient && initialPatient !== 'all') return initialPatient;
    return allPatients[0] || 'Carlos Mendoza';
  });

  // Filtrar sesiones del paciente seleccionado
  const patientSessions = sessions.filter(
    (s) => s.paciente.toLowerCase() === activePatient.toLowerCase()
  );

  // Ordenadas de más reciente a más antigua
  const sortedSessions = [...patientSessions].sort(
    (a, b) => new Date(b.d).getTime() - new Date(a.d).getTime()
  );

  const lastSession = sortedSessions[0];

  // Métricas acumuladas del paciente
  const totalStars = patientSessions.reduce((acc, s) => acc + (s.stars || 0), 0);
  const totalPoints = patientSessions.reduce((acc, s) => acc + (s.score || 0), 0);
  const totalMinutes = Math.round(
    patientSessions.reduce((acc, s) => acc + (s.dur || 0), 0) / 60
  );
  const totalReps = patientSessions.reduce(
    (acc, s) => acc + calculateTotalReps(s.reps),
    0
  );
  const winsCount = patientSessions.filter(
    (s) => (s.res || '').toLowerCase() === 'win'
  ).length;

  // Max por dedo de este paciente
  const maxPerFinger: Record<FingerKey, number> = {
    p: 0,
    i: 0,
    m: 0,
    a: 0,
    k: 0,
  };

  FINGERS.forEach((f) => {
    const vals = patientSessions.map((s) => Number(s.max[f.key]) || 0);
    maxPerFinger[f.key] = vals.length > 0 ? Math.max(...vals) : 0;
  });

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida y Selector de Paciente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Modo Paciente Activo · Entrenamiento de Mano</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ¡Hola, {activePatient}! 👋
            </h2>
            <p className="text-sm text-teal-100 max-w-xl">
              ¡Excelente trabajo en tu rehabilitación! Cada sesión con el guante ayuda a que tus dedos ganen más movimiento y fuerza.
            </p>
          </div>

          {/* Selector de Paciente & Botón Volver */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {userRole === 'fisio' && allPatients.length > 1 && (
              <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs backdrop-blur-xs border border-white/20">
                <User className="h-4 w-4 text-teal-200" />
                <select
                  value={activePatient}
                  onChange={(e) => setActivePatient(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                  title="Supervisar progreso de otro paciente"
                >
                  {allPatients.map((p) => (
                    <option key={p} value={p} className="text-slate-900">
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {userRole === 'fisio' && onSwitchToClinician && (
              <button
                onClick={onSwitchToClinician}
                className="px-3.5 py-2 rounded-xl bg-white text-teal-900 text-xs font-bold hover:bg-teal-50 transition-colors shadow-xs"
              >
                Ver Modo Fisioterapeuta
              </button>
            )}

            {userRole === 'paciente' && (
              <div className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-semibold backdrop-blur-xs border border-white/20">
                <Heart className="h-4 w-4 text-rose-300" />
                <span>Plan Activo de Recuperación</span>
              </div>
            )}
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Mario Rehab Game Launcher Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-xs">
            <Gamepad2 className="h-3.5 w-3.5 text-amber-300" />
            <span>Juego de Rehabilitación Oficial</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Super Mario Rehab v10
          </h3>
          <p className="text-xs text-purple-100 max-w-lg">
            ¡Conecta tu guante sensorizado! Salta, esquiva y supera obstáculos flexionando tus dedos para ganar estrellas y recuperar la movilidad de tu mano.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenGame}
          className="z-10 w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-purple-950 font-extrabold hover:bg-purple-50 transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Play className="h-4 w-4 fill-purple-950 text-purple-950" />
          <span>¡JUGAR MARIO REHAB!</span>
        </button>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/30 blur-2xl pointer-events-none" />
      </div>

      {/* Tarjetas de Logros Gamificados */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Estrellas */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/50">
            <Star className="h-5 w-5 fill-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            {totalStars} ★
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Estrellas Ganadas
          </div>
        </div>

        {/* Puntos de Superación */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-950/50">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            {totalPoints.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Puntos Totales
          </div>
        </div>

        {/* Movimientos de Mano */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-950/50">
            <Zap className="h-5 w-5" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-teal-600 dark:text-teal-400">
            {totalReps}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Movimientos Realizados
          </div>
        </div>

        {/* Partidas Ganadas */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            {winsCount} / {patientSessions.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Victorias en Juegos
          </div>
        </div>
      </div>

      {/* Sección Principal: El Camino a los 90° (Tus 5 Dedos) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Tu Meta de Flexión (El Desafío de los 90°)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              El objetivo de la terapia es que cada uno de tus dedos alcance los 90° de cierre completo.
            </p>
          </div>
          <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
            Meta: 90° de flexión
          </span>
        </div>

        {/* Barras de Progreso por Dedo */}
        <div className="mt-5 space-y-4">
          {FINGERS.map((finger) => {
            const currentVal = lastSession ? Number(lastSession.max[finger.key]) || 0 : 0;
            const threshold = lastSession ? Number(lastSession.th[finger.key]) || 0 : 70;
            const recordVal = maxPerFinger[finger.key] || currentVal;
            const pct = Math.min(100, Math.round((currentVal / 90) * 100));
            const reachedThreshold = currentVal >= threshold;

            return (
              <div
                key={finger.key}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3.5 w-3.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: finger.color }}
                    />
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Dedo {finger.nombre}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400">
                      Récord: <strong className="text-slate-800 dark:text-slate-200">{recordVal}°</strong>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {currentVal}° <span className="text-slate-400 font-normal">/ 90°</span>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-4 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: finger.color,
                    }}
                  />
                  {/* Threshold mark on progress bar */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white dark:bg-slate-900 shadow-sm"
                    style={{ left: `${(threshold / 90) * 100}%` }}
                    title={`Umbral de sesión: ${threshold}°`}
                  />
                </div>

                {/* Footer status label */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {pct >= 90
                      ? '🌟 ¡Excelente flexibilidad y cierre!'
                      : pct >= 70
                      ? '👍 ¡Muy buen avance motriz!'
                      : '💪 ¡Sigue practicando, cada grado cuenta!'}
                  </span>

                  <span
                    className={`font-semibold text-[11px] ${
                      reachedThreshold
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {reachedThreshold
                      ? `✓ Meta diaria superada (≥${threshold}°)`
                      : `Faltan ${threshold - currentVal}° para el objetivo de hoy (${threshold}°)`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tus Últimas Sesiones de Juego (Tarjetas Amigables) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Gamepad2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            Tus Últimas Partidas y Entrenamientos
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sortedSessions.slice(0, 6).map((session, idx) => {
            const isWin = (session.res || '').toLowerCase() === 'win';
            const gameName =
              session.g === 'car'
                ? 'Carrera (Car)'
                : session.g === 'piano'
                ? 'Piano Melódico'
                : 'Super Mario';

            return (
              <div
                key={session.id || idx}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {gameName}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isWin
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isWin ? '¡Victoria!' : 'Completado'}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {formatReadableDateTime(session.d)} · Nivel {session.lv}
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 font-mono text-xs">
                  <span className="text-amber-500 font-bold text-sm">
                    {'★'.repeat(Math.max(1, session.stars))}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {session.score} pts
                  </span>
                  <span className="text-slate-500">
                    {formatDuration(session.dur)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
