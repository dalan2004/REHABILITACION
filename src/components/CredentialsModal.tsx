import React, { useState } from 'react';
import {
  getStoredCredentials,
  saveCredentials,
  DEFAULT_CREDENTIALS,
} from '../utils/credentialsService';
import { KeyRound, Lock, Eye, EyeOff, Check, AlertCircle, RotateCcw, X, ShieldCheck } from 'lucide-react';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsUpdated?: () => void;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  onCredentialsUpdated,
}) => {
  const currentCreds = getStoredCredentials();

  const [fisioName, setFisioName] = useState(currentCreds.fisioName);
  const [fisioEmail, setFisioEmail] = useState(currentCreds.fisioEmail);
  const [newPassword, setNewPassword] = useState(currentCreds.fisioPassword);
  const [confirmPassword, setConfirmPassword] = useState(currentCreds.fisioPassword);
  const [patientPin, setPatientPin] = useState(currentCreds.patientDefaultPin);

  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!newPassword.trim()) {
      setErrorMessage('La contraseña no puede estar vacía.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Verifícalas.');
      return;
    }

    saveCredentials({
      fisioName: fisioName.trim(),
      fisioEmail: fisioEmail.trim(),
      fisioPassword: newPassword.trim(),
      patientDefaultPin: patientPin.trim() || '1234',
    });

    setSuccessMessage('¡Credenciales guardadas correctamente en tu navegador!');
    if (onCredentialsUpdated) onCredentialsUpdated();

    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  const handleResetDefaults = () => {
    setFisioName(DEFAULT_CREDENTIALS.fisioName);
    setFisioEmail(DEFAULT_CREDENTIALS.fisioEmail);
    setNewPassword(DEFAULT_CREDENTIALS.fisioPassword);
    setConfirmPassword(DEFAULT_CREDENTIALS.fisioPassword);
    setPatientPin(DEFAULT_CREDENTIALS.patientDefaultPin);
    saveCredentials(DEFAULT_CREDENTIALS);
    setSuccessMessage('Se han restaurado las credenciales por defecto (fisio123 / 1234).');
    if (onCredentialsUpdated) onCredentialsUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Configuración de Contraseñas y Accesos
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Define las credenciales para el fisioterapeuta y los pacientes
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="mt-3.5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-3.5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
          {/* SECCIÓN FISIOTERAPEUTA */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-xs">
              <Lock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Contraseña del Fisioterapeuta</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                  Nombre del profesional:
                </label>
                <input
                  type="text"
                  value={fisioName}
                  onChange={(e) => setFisioName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                  Correo del profesional:
                </label>
                <input
                  type="email"
                  value={fisioEmail}
                  onChange={(e) => setFisioEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                  Nueva Contraseña:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-8 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                  Repetir Contraseña:
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              Contraseña por defecto inicial: <code className="font-mono font-bold text-slate-600 dark:text-slate-300">fisio123</code>
            </p>
          </div>

          {/* SECCIÓN PACIENTE */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>PIN de Acceso para Pacientes</span>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                PIN de 4 dígitos para ingresar al Modo Paciente:
              </label>
              <input
                type="text"
                maxLength={6}
                value={patientPin}
                onChange={(e) => setPatientPin(e.target.value)}
                placeholder="1234"
                className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-center tracking-widest"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              PIN por defecto: <code className="font-mono font-bold text-slate-600 dark:text-slate-300">1234</code>
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Restaurar contraseñas de fábrica</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
              >
                Cerrar
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-500 transition-colors shadow-xs"
              >
                Guardar Contraseña
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
