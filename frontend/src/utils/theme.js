const THEME_STORAGE_KEY = 'siteTheme';
const THEME_EVENT = 'site-theme-updated';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';

const normalizeTheme = (value) => (value === DARK_THEME ? DARK_THEME : LIGHT_THEME);

const applyThemeClass = (theme) => {
  if (typeof document === 'undefined') {
    return;
  }

  const isDarkTheme = theme === DARK_THEME;

  document.body.classList.toggle('dark-mode', isDarkTheme);
  document.documentElement.style.colorScheme = isDarkTheme ? 'dark' : 'light';
};

export const getStoredTheme = () => {
  if (typeof window === 'undefined') {
    return LIGHT_THEME;
  }

  try {
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return LIGHT_THEME;
  }
};

export const applyStoredTheme = () => {
  const theme = getStoredTheme();
  applyThemeClass(theme);
  return theme;
};

export const setTheme = (theme) => {
  const normalizedTheme = normalizeTheme(theme);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
    } catch {
      // Continue with an in-memory theme if storage is unavailable.
    }

    applyThemeClass(normalizedTheme);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return normalizedTheme;
};

export const toggleTheme = () =>
  setTheme(getStoredTheme() === DARK_THEME ? LIGHT_THEME : DARK_THEME);

export const subscribeToTheme = (callback) => {
  const notify = () => {
    const theme = applyStoredTheme();
    callback(theme);
  };

  window.addEventListener(THEME_EVENT, notify);
  window.addEventListener('storage', notify);

  return () => {
    window.removeEventListener(THEME_EVENT, notify);
    window.removeEventListener('storage', notify);
  };
};
