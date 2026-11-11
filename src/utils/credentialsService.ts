import { CredentialsConfig } from '../types/rehab';

const CREDENTIALS_KEY = 'rehab_credentials_config';

export const DEFAULT_CREDENTIALS: CredentialsConfig = {
  fisioEmail: 'fisio@kineglove.cl',
  fisioPassword: 'fisio123',
  fisioName: 'Lic. Valentina Solís',
  patientDefaultPin: '1234',
};

export function getStoredCredentials(): CredentialsConfig {
  if (typeof window === 'undefined') return DEFAULT_CREDENTIALS;
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (!raw) return DEFAULT_CREDENTIALS;
    return { ...DEFAULT_CREDENTIALS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CREDENTIALS;
  }
}

export function saveCredentials(config: Partial<CredentialsConfig>): CredentialsConfig {
  const current = getStoredCredentials();
  const updated: CredentialsConfig = {
    ...current,
    ...config,
  };
  try {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error al guardar credenciales en localStorage', e);
  }
  return updated;
}

export function validateFisioPassword(inputPassword: string): boolean {
  const current = getStoredCredentials();
  return inputPassword.trim() === current.fisioPassword.trim();
}

export function validatePatientPin(inputPin: string): boolean {
  const current = getStoredCredentials();
  // Acepta el PIN configurado o el de demostración 1234
  return inputPin.trim() === current.patientDefaultPin.trim() || inputPin.trim() === '1234';
}
