export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme-preference';

/**
 * Obtiene la preferencia del sistema
 */
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/**
 * Obtiene el tema guardado en localStorage o la preferencia del sistema
 */
export function getSavedTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  return saved || getSystemTheme();
}

/**
 * Guarda el tema en localStorage
 */
export function saveTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme);
}

/**
 * Aplica el tema al documento
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  
  // Remover ambas clases primero
  root.classList.remove('light', 'dark');
  
  // Añadir la clase correspondiente
  root.classList.add(theme);
  
  // Actualizar el atributo data-theme para mayor compatibilidad
  root.setAttribute('data-theme', theme);
}

/**
 * Alterna entre tema claro y oscuro
 */
export function toggleTheme(): Theme {
  const currentTheme = getSavedTheme();
  const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
  
  saveTheme(newTheme);
  applyTheme(newTheme);
  
  return newTheme;
}

/**
 * Inicializa el tema al cargar la página
 */
export function initTheme(): void {
  const theme = getSavedTheme();
  applyTheme(theme);
  
  // Escuchar cambios en la preferencia del sistema (solo si no hay preferencia guardada)
  if (!localStorage.getItem(STORAGE_KEY)) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      const newTheme = e.matches ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }
}
