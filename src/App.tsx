import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SessionItem } from './types/rehab';
import { SAMPLE_SESSIONS } from './data/sampleSessions';
import { normalizeSession } from './utils/rehabUtils';
import { UrlFetcherBar } from './components/UrlFetcherBar';
import { FilterControls } from './components/FilterControls';
import { ThresholdAlert } from './components/ThresholdAlert';
import { KpiMetrics } from './components/KpiMetrics';
import { FingerRomBarChart } from './components/FingerRomBarChart';
import { EvolutionLineChart } from './components/EvolutionLineChart';
import { SessionsListTable } from './components/SessionsListTable';
import { PatientModeView } from './components/PatientModeView';
import { Activity, Sun, Moon, Stethoscope, UserCheck, Gamepad2 } from 'lucide-react';

const STORAGE_URL_KEY = 'rehab_data_url';
const STORAGE_VIEW_MODE_KEY = 'rehab_view_mode';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rehab_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rehab_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rehab_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // View Mode: 'fisioterapeuta' o 'paciente'
  const [viewMode, setViewMode] = useState<'fisioterapeuta' | 'paciente'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_VIEW_MODE_KEY);
      if (saved === 'paciente' || saved === 'fisioterapeuta') return saved;
    }
    return 'fisioterapeuta';
  });

  const handleSetViewMode = (mode: 'fisioterapeuta' | 'paciente') => {
    setViewMode(mode);
    localStorage.setItem(STORAGE_VIEW_MODE_KEY, mode);
  };

  // URL state
  const [url, setUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_URL_KEY) || '';
    }
    return '';
  });

  // Data & loading state
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSuccessTime, setLastSuccessTime] = useState<Date | null>(null);
  const [isUsingSampleData, setIsUsingSampleData] = useState<boolean>(false);

  // Filters state (para modo fisioterapeuta)
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Fetch GET without custom headers
  const fetchData = useCallback(
    async (targetUrl?: string) => {
      const endpoint = (targetUrl !== undefined ? targetUrl : url).trim();

      if (!endpoint) {
        // Si no hay URL, cargamos los datos de prueba iniciales
        setSessions(SAMPLE_SESSIONS.map(normalizeSession));
        setIsUsingSampleData(true);
        setLastSuccessTime(new Date());
        setErrorMessage(null);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        // Fetch GET a esa URL sin cabeceras personalizadas
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();

        // Si la respuesta es {"error": ...} muestra ese error
        if (json && typeof json === 'object' && !Array.isArray(json) && json.error) {
          setErrorMessage(String(json.error));
          setIsLoading(false);
          return;
        }

        if (!Array.isArray(json)) {
          throw new Error('La respuesta del servidor no es un arreglo JSON válido de sesiones.');
        }

        const normalized = json.map(normalizeSession);
        setSessions(normalized);
        setIsUsingSampleData(false);
        setLastSuccessTime(new Date());
        setErrorMessage(null);

        // Guardar en localStorage
        localStorage.setItem(STORAGE_URL_KEY, endpoint);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setErrorMessage(
          err.message || 'No se pudo conectar a la URL indicada (verifique permisos o CORS).'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [url]
  );

  // Initial load on open
  useEffect(() => {
    const savedUrl = localStorage.getItem(STORAGE_URL_KEY);
    if (savedUrl) {
      setUrl(savedUrl);
      fetchData(savedUrl);
    } else {
      // Cargar datos de prueba iniciales para que la interfaz se vea inmediatamente completa
      setSessions(SAMPLE_SESSIONS.map(normalizeSession));
      setIsUsingSampleData(true);
      setLastSuccessTime(new Date());
    }
  }, [fetchData]);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    localStorage.setItem(STORAGE_URL_KEY, newUrl);
  };

  const handleLoadSampleData = () => {
    setSessions(SAMPLE_SESSIONS.map(normalizeSession));
    setIsUsingSampleData(true);
    setErrorMessage(null);
    setLastSuccessTime(new Date());
  };

  // Unique patients for filter dropdown and patient mode
  const patientsList = useMemo(() => {
    const list = Array.from(new Set(sessions.map((s) => s.paciente.trim()))).filter(Boolean);
    return list.sort();
  }, [sessions]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // Filtro por paciente
      if (selectedPatient !== 'all' && s.paciente.toLowerCase() !== selectedPatient.toLowerCase()) {
        return false;
      }
      // Filtro por juego
      if (selectedGame !== 'all') {
        const game = (s.g || 'mario').toLowerCase();
        if (game !== selectedGame.toLowerCase()) return false;
      }
      // Filtro por fecha inicio
      if (startDate) {
        const sessionDate = s.d.split('T')[0];
        if (sessionDate < startDate) return false;
      }
      // Filtro por fecha fin
      if (endDate) {
        const sessionDate = s.d.split('T')[0];
        if (sessionDate > endDate) return false;
      }
      return true;
    });
  }, [sessions, selectedPatient, selectedGame, startDate, endDate]);

  // Most recent session among filtered
  const lastSession = useMemo(() => {
    if (filteredSessions.length === 0) return undefined;
    const sorted = [...filteredSessions].sort(
      (a, b) => new Date(b.d).getTime() - new Date(a.d).getTime()
    );
    return sorted[0];
  }, [filteredSessions]);

  const handleResetFilters = () => {
    setSelectedPatient('all');
    setSelectedGame('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                KineGlove <span className="text-teal-600 dark:text-teal-400 font-semibold">Rehab</span>
              </h1>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Supervisión Kinésica de Rehabilitación de Mano
              </span>
            </div>
          </div>

          {/* Mode Switcher: Modo Fisioterapeuta vs Modo Paciente */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => handleSetViewMode('fisioterapeuta')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'fisioterapeuta'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Modo Fisioterapeuta</span>
            </button>

            <button
              onClick={() => handleSetViewMode('paciente')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'paciente'
                  ? 'bg-teal-600 text-white shadow-xs dark:bg-teal-500'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>Modo Paciente</span>
            </button>
          </div>

          {/* Right Header: Theme Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleDarkMode}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
        {/* VISTA 1: MODO PACIENTE */}
        {viewMode === 'paciente' ? (
          <PatientModeView
            sessions={sessions}
            allPatients={patientsList}
            initialPatient={selectedPatient !== 'all' ? selectedPatient : undefined}
            onSwitchToClinician={() => handleSetViewMode('fisioterapeuta')}
          />
        ) : (
          /* VISTA 2: MODO FISIOTERAPEUTA (PANEL CLÍNICO COMPLETO) */
          <>
            {/* 1. URL Fetcher & Refresh Bar */}
            <UrlFetcherBar
              url={url}
              onUrlChange={handleUrlChange}
              onFetch={fetchData}
              onLoadSampleData={handleLoadSampleData}
              isLoading={isLoading}
              errorMessage={errorMessage}
              lastSuccessTime={lastSuccessTime}
              isUsingSampleData={isUsingSampleData}
            />

            {/* 2. Red Alert: Dedo que no llegó a su umbral en la última sesión */}
            <ThresholdAlert lastSession={lastSession} />

            {/* 3. Filtros Clínicos (por paciente, por juego, por rango de fechas) */}
            <FilterControls
              patients={patientsList}
              selectedPatient={selectedPatient}
              onSelectPatient={setSelectedPatient}
              selectedGame={selectedGame}
              onSelectGame={setSelectedGame}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
              onResetFilters={handleResetFilters}
              totalFiltered={filteredSessions.length}
              totalAvailable={sessions.length}
            />

            {/* 4. Tarjetas con Indicadores Generales (Sesiones, Reps, ROM máx por dedo con colores, Fuerza máx) */}
            <KpiMetrics sessions={filteredSessions} />

            {/* 5. Dos Gráficas Principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Gráfica de barras del rango de movimiento por dedo (última sesión vs promedio) con línea en 90° */}
              <FingerRomBarChart
                lastSession={lastSession}
                sessions={filteredSessions}
              />

              {/* Gráfica de líneas de la evolución en el tiempo (reps por sesión y rango medio) */}
              <EvolutionLineChart sessions={filteredSessions} />
            </div>

            {/* 6. Tabla de Sesiones (de la más reciente a la más antigua) */}
            <SessionsListTable sessions={filteredSessions} />
          </>
        )}
      </main>
    </div>
  );
}
