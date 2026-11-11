/**
 * Modelos de datos para el seguimiento de rehabilitación de mano
 */

export type GameType = 'mario' | 'car' | 'piano' | string;
export type ResultType = 'win' | 'lose' | 'quit' | string;
export type FingerKey = 'p' | 'i' | 'm' | 'a' | 'k';

export type UserRole = 'fisio' | 'paciente';

export interface AuthUser {
  role: UserRole;
  name: string;
  email?: string;
  patientName?: string; // Para rol paciente: vincula a su nombre en las sesiones
  licenseNumber?: string; // Para rol fisio
}

export interface CredentialsConfig {
  fisioEmail: string;
  fisioPassword: string;
  fisioName: string;
  patientDefaultPin: string;
}

export interface FingerValues {
  p: number; // Pulgar (0 - 90°)
  i: number; // Índice (0 - 90°)
  m: number; // Medio (0 - 90°)
  a: number; // Anular (0 - 90°)
  k: number; // Meñique (0 - 90°)
}

export interface RepsValues {
  l?: number; // Izquierda / Left
  j?: number; // Salto / Jump
  r?: number; // Derecha / Right
  d?: number; // Abajo / Down
  s?: number; // Especial / Escudo / Shield
  f?: number; // Fuego / Fire
  [key: string]: number | undefined;
}

export interface SessionItem {
  id: string | number;
  d: string; // Fecha ISO
  paciente: string;
  g?: GameType; // "mario" | "car" | "piano" (si falta, se asume "mario")
  lv: number; // Nivel
  res: ResultType; // "win" | "lose" | "quit"
  score: number;
  stars: number;
  dur: number; // Duración en segundos
  reps: RepsValues;
  max: FingerValues; // Rango de movimiento alcanzado por dedo (meta 90°)
  fm: number; // Fuerza de palma máxima
  fa: number; // Fuerza promedio
  grips: number;
  kills?: number;
  coins?: number;
  ct?: number;
  lives?: number;
  sim?: boolean; // true = prueba sin guante, false/undefined = guante
  th: FingerValues; // Umbrales configurados para la sesión
}

export interface FingerMeta {
  key: FingerKey;
  nombre: string;
  nombreCorto: string;
  color: string;
  colorBg: string;
  colorBorder: string;
}

export const FINGERS: FingerMeta[] = [
  {
    key: 'p',
    nombre: 'Pulgar',
    nombreCorto: 'Pulgar',
    color: '#F59E0B', // Amber 500
    colorBg: 'rgba(245, 158, 11, 0.15)',
    colorBorder: '#D97706',
  },
  {
    key: 'i',
    nombre: 'Índice',
    nombreCorto: 'Índice',
    color: '#0EA5E9', // Sky 500
    colorBg: 'rgba(14, 165, 233, 0.15)',
    colorBorder: '#0284C7',
  },
  {
    key: 'm',
    nombre: 'Medio',
    nombreCorto: 'Medio',
    color: '#10B981', // Emerald 500
    colorBg: 'rgba(16, 185, 129, 0.15)',
    colorBorder: '#059669',
  },
  {
    key: 'a',
    nombre: 'Anular',
    nombreCorto: 'Anular',
    color: '#8B5CF6', // Violet 500
    colorBg: 'rgba(139, 92, 246, 0.15)',
    colorBorder: '#7C3AED',
  },
  {
    key: 'k',
    nombre: 'Meñique',
    nombreCorto: 'Meñique',
    color: '#EC4899', // Pink 500
    colorBg: 'rgba(236, 72, 153, 0.15)',
    colorBorder: '#DB2777',
  },
];
