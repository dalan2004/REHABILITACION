import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types/rehab';
import {
  getStoredCredentials,
  validateFisioPassword,
  validatePatientPin,
} from '../utils/credentialsService';
import { CredentialsModal } from './CredentialsModal';
import {
  Activity,
  Stethoscope,
  Gamepad2,
  ArrowRight,
  Lock,
  User,
  Mail,
  Sparkles,
  Sun,
  Moon,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: AuthUser) => void;
  availablePatients: string[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  availablePatients,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('fisio');
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  // Fisio form state
  const creds = getStoredCredentials();
  const [fisioName, setFisioName] = useState(creds.fisioName);
  const [fisioEmail, setFisioEmail] = useState(creds.fisioEmail);
  const [fisioPassword, setFisioPassword] = useState('fisio123');
  const [showFisioPassword, setShowFisioPassword] = useState(false);

  // Paciente form state
  const defaultPatient = availablePatients[0] || 'Carlos Mendoza';
  const [patientName, setPatientName] = useState(defaultPatient);
  const [patientPin, setPatientPin] = useState('1234');
  const [customPatientInput, setCustomPatientInput] = useState('');
  const [isCustomPatient, setIsCustomPatient] = useState(false);

  const [authError, setAuthError] = useState<string | null>(null);

  const handleCredentialsUpdated = () => {
    const updated = getStoredCredentials();
    setFisioName(updated.fisioName);
    setFisioEmail(updated.fisioEmail);
    setFisioPassword(updated.fisioPassword);
    setPatientPin(updated.patientDefaultPin);
    setAuthError(null);
  };

  const handleFisioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!fisioName.trim()) {
      setAuthError('Por favor ingresa tu nombre profesional.');
      return;
    }

    if (!validateFisioPassword(fisioPassword)) {
      setAuthError('Contraseña incorrecta. (La contraseña por defecto es: fisio123 o puedes cambiarla en "Configurar Contraseñas")');
      return;
    }

    onLogin({
      role: 'fisio',
      name: fisioName.trim(),
      email: fisioEmail.trim(),
      licenseNumber: 'COL-KINE-84920',
    });
  };

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const finalName = isCustomPatient ? customPatientInput.trim() : patientName;
    if (!finalName) {
      setAuthError('Por favor selecciona o escribe tu nombre.');
      return;
    }

    if (!validatePatientPin(patientPin)) {
      setAuthError('PIN de paciente incorrecto. (El PIN por defecto es: 1234)');
      return;
    }

    onLogin({
      role: 'paciente',
      name: finalName,
      patientName: finalName,
    });
  };

  const handleQuickDemoFisio = () => {
    const stored = getStoredCredentials();
    onLogin({
      role: 'fisio',
      name: stored.fisioName,
      email: stored.fisioEmail,
      licenseNumber: 'COL-KINE-84920',
    });
  };

  const handleQuickDemoPatient = (name: string) => {
    onLogin({
      role: 'paciente',
      name: name,
      patientName: name,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 py-3.5 px-4 sm:px-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                KineGlove <span className="text-teal-600 dark:text-teal-400 font-semibold">Rehab</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Plataforma de Supervisión y Entrenamiento de Mano
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Button to open credentials settings */}
            <button
              onClick={() => setIsCredentialsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              title="Configurar contraseña y PINs"
            >
              <KeyRound className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">Configurar Contraseña</span>
            </button>

            {/* Dark mode */}
            <button
              onClick={onToggleDarkMode}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md space-y-4">
          {/* Header Title */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Inicio de Sesión
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selecciona tu perfil de acceso para continuar
            </p>
          </div>

          {/* Role Segmented Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('fisio');
                setAuthError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-all ${
                selectedRole === 'fisio'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Fisioterapeuta</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('paciente');
                setAuthError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-all ${
                selectedRole === 'paciente'
                  ? 'bg-teal-600 text-white shadow-xs dark:bg-teal-500'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Gamepad2 className="h-4 w-4" />
              <span>Paciente</span>
            </button>
          </div>

          {/* Auth Error Banner */}
          {authError && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{authError}</span>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            {selectedRole === 'fisio' ? (
              /* --- FORMULARIO FISIOTERAPEUTA --- */
              <form onSubmit={handleFisioSubmit} className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Acceso Profesional Kinésico
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ingresa a la consola clínica para supervisar arcos ROM, fuerzas FSR y alertas de estancamiento.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del Profesional:
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fisioName}
                      onChange={(e) => setFisioName(e.target.value)}
                      placeholder="Lic. Valentina Solís"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Correo Electrónico Clínico:
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={fisioEmail}
                      onChange={(e) => setFisioEmail(e.target.value)}
                      placeholder="fisio@kineglove.cl"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Contraseña:
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCredentialsModalOpen(true)}
                      className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                    >
                      <KeyRound className="h-3 w-3" />
                      <span>¿Cambiar contraseña?</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showFisioPassword ? 'text' : 'password'}
                      required
                      value={fisioPassword}
                      onChange={(e) => setFisioPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña..."
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-9 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFisioPassword(!showFisioPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showFisioPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Helpful Credential Note */}
                <div className="rounded-lg bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/40 p-2.5 text-[11px] text-teal-900 dark:text-teal-200 flex items-center justify-between">
                  <span>
                    🔑 Contraseña inicial: <code className="font-mono font-bold">fisio123</code>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCredentialsModalOpen(true)}
                    className="font-bold underline ml-1 hover:text-teal-700"
                  >
                    Personalizar
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors shadow-xs"
                >
                  <span>Ingresar como Fisioterapeuta</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Acceso Rápido Demo */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleQuickDemoFisio}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Acceso Rápido Demo Fisioterapeuta (1 clic)</span>
                  </button>
                </div>
              </form>
            ) : (
              /* --- FORMULARIO PACIENTE --- */
              <form onSubmit={handlePatientSubmit} className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Gamepad2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Acceso para Pacientes
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ingresa a tu centro de entrenamiento para ver tu racha de estrellas, tu camino hacia los 90° y tus juegos.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Selecciona o ingresa tu Nombre:
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomPatient(!isCustomPatient)}
                      className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      {isCustomPatient ? 'Elegir de la lista' : 'Escribir otro nombre'}
                    </button>
                  </div>

                  {isCustomPatient ? (
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={customPatientInput}
                        onChange={(e) => setCustomPatientInput(e.target.value)}
                        placeholder="Escribe tu nombre completo..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                      <select
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
                      >
                        {availablePatients.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PIN de Paciente (4 dígitos):
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      maxLength={6}
                      value={patientPin}
                      onChange={(e) => setPatientPin(e.target.value)}
                      placeholder="1234"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-3 py-2 text-xs text-slate-900 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    PIN inicial: <code className="font-mono font-bold">1234</code>
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-500 transition-colors shadow-xs"
                >
                  <span>Comenzar mi Entrenamiento</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Accesos rápidos a pacientes existentes */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                    Acceso Rápido por Paciente:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoPatient('Carlos Mendoza')}
                      className="py-1.5 px-2 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 text-left truncate transition-colors"
                    >
                      Carlos Mendoza
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoPatient('Elena Morales')}
                      className="py-1.5 px-2 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 text-left truncate transition-colors"
                    >
                      Elena Morales
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer with settings link */}
      <footer className="w-full py-4 px-4 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
        <span>KineGlove Rehab · Sistema Clínico de Fisioterapia y Rehabilitación Motriz</span>
        <button
          onClick={() => setIsCredentialsModalOpen(true)}
          className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
        >
          <KeyRound className="h-3 w-3" />
          <span>Configurar Contraseñas</span>
        </button>
      </footer>

      {/* Modal de Configuración de Contraseñas */}
      <CredentialsModal
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        onCredentialsUpdated={handleCredentialsUpdated}
      />
    </div>
  );
};
