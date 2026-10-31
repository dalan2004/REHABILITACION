import { FingerKey, FINGERS, RepsValues, SessionItem } from '../types/rehab';

export function calculateTotalReps(reps?: RepsValues): number {
  if (!reps) return 0;
  return (
    (Number(reps.l) || 0) +
    (Number(reps.j) || 0) +
    (Number(reps.r) || 0) +
    (Number(reps.d) || 0) +
    (Number(reps.s) || 0) +
    (Number(reps.f) || 0)
  );
}

export function calculateAverageRom(max?: { p?: number; i?: number; m?: number; a?: number; k?: number }): number {
  if (!max) return 0;
  const vals = [max.p, max.i, max.m, max.a, max.k].map((v) => Number(v) || 0);
  const sum = vals.reduce((a, b) => a + b, 0);
  return Number((sum / 5).toFixed(1));
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  const remS = s % 60;
  if (m === 0) return `${remS}s`;
  if (remS === 0) return `${m}m`;
  return `${m}m ${remS}s`;
}

export function formatReadableDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toISOString().split('T')[0];
  } catch {
    return isoString;
  }
}

export interface FailedThreshold {
  finger: FingerKey;
  fingerName: string;
  actual: number;
  threshold: number;
  deficit: number;
  color: string;
}

/**
 * Detecta qué dedos no llegaron a su umbral 'th' en la sesión dada
 */
export function getFailedThresholds(session: SessionItem): FailedThreshold[] {
  if (!session || !session.max || !session.th) return [];

  const failed: FailedThreshold[] = [];
  for (const finger of FINGERS) {
    const actual = Number(session.max[finger.key]) || 0;
    const threshold = Number(session.th[finger.key]) || 0;

    if (actual < threshold) {
      failed.push({
        finger: finger.key,
        fingerName: finger.nombre,
        actual,
        threshold,
        deficit: threshold - actual,
        color: finger.color,
      });
    }
  }

  return failed;
}

/**
 * Normaliza una sesión garantizando que si 'g' no existe, se tome como 'mario'
 */
export function normalizeSession(raw: any, index: number): SessionItem {
  return {
    id: raw.id ?? `ses-${index + 1}`,
    d: String(raw.d || new Date().toISOString()),
    paciente: String(raw.paciente || 'Paciente General').trim(),
    g: (raw.g ? String(raw.g).toLowerCase() : 'mario') as any,
    lv: Number(raw.lv) || 1,
    res: (raw.res ? String(raw.res).toLowerCase() : 'win') as any,
    score: Number(raw.score) || 0,
    stars: Number(raw.stars) || 0,
    dur: Number(raw.dur) || 0,
    reps: {
      l: Number(raw.reps?.l) || 0,
      j: Number(raw.reps?.j) || 0,
      r: Number(raw.reps?.r) || 0,
      d: Number(raw.reps?.d) || 0,
      s: Number(raw.reps?.s) || 0,
      f: Number(raw.reps?.f) || 0,
    },
    max: {
      p: Math.min(90, Math.max(0, Number(raw.max?.p) || 0)),
      i: Math.min(90, Math.max(0, Number(raw.max?.i) || 0)),
      m: Math.min(90, Math.max(0, Number(raw.max?.m) || 0)),
      a: Math.min(90, Math.max(0, Number(raw.max?.a) || 0)),
      k: Math.min(90, Math.max(0, Number(raw.max?.k) || 0)),
    },
    fm: Number(raw.fm) || 0,
    fa: Number(raw.fa) || 0,
    grips: Number(raw.grips) || 0,
    kills: Number(raw.kills) || 0,
    coins: Number(raw.coins) || 0,
    ct: Number(raw.ct) || 0,
    lives: Number(raw.lives) || 0,
    sim: Boolean(raw.sim),
    th: {
      p: Number(raw.th?.p) || 70,
      i: Number(raw.th?.i) || 70,
      m: Number(raw.th?.m) || 70,
      a: Number(raw.th?.a) || 65,
      k: Number(raw.th?.k) || 60,
    },
  };
}
