const GAME_URL_STORAGE_KEY = 'rehab_game_mario_url';

export const BUNDLED_GAME_URL = '/mario-rehab.html';
export const ASSET_GAME_URL = '/assets/aistudio/mario_rehab_v10__2___1__589f7dba.html';
export const LOCAL_FILE_URL = 'file:///C:/Users/dalan/Downloads/mario_rehab_v10%20(2)%20(1).html';

export const DEFAULT_MARIO_GAME_URL = BUNDLED_GAME_URL;

export function getMarioGameUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_MARIO_GAME_URL;
  try {
    const saved = localStorage.getItem(GAME_URL_STORAGE_KEY);
    return saved || DEFAULT_MARIO_GAME_URL;
  } catch {
    return DEFAULT_MARIO_GAME_URL;
  }
}

export function saveMarioGameUrl(url: string): void {
  try {
    localStorage.setItem(GAME_URL_STORAGE_KEY, url.trim());
  } catch (e) {
    console.error('Error guardando URL del juego en localStorage', e);
  }
}
