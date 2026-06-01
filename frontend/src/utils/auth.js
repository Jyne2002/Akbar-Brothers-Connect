const USER_INFO_KEY = 'userInfo';
const USER_INFO_EVENT = 'user-info-updated';
const USER_INFO_FRESH_UNTIL_KEY = 'userInfoFreshUntil';
const USER_INFO_FRESH_DURATION_MS = 15000;

const setFreshUserWindow = (durationMs = USER_INFO_FRESH_DURATION_MS) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(
      USER_INFO_FRESH_UNTIL_KEY,
      String(Date.now() + durationMs),
    );
  } catch {
    // Continue without the freshness hint if session storage is unavailable.
  }
};

const clearFreshUserWindow = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(USER_INFO_FRESH_UNTIL_KEY);
  } catch {
    // Ignore storage cleanup issues and continue clearing the main auth state.
  }
};

export const getStoredUser = () => {
  try {
    const rawValue = localStorage.getItem(USER_INFO_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
  setFreshUserWindow();
  window.dispatchEvent(new Event(USER_INFO_EVENT));
};

export const clearStoredUser = () => {
  localStorage.removeItem(USER_INFO_KEY);
  clearFreshUserWindow();
  window.dispatchEvent(new Event(USER_INFO_EVENT));
};

export const hasFreshStoredUser = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return Number(window.sessionStorage.getItem(USER_INFO_FRESH_UNTIL_KEY) || 0) > Date.now();
  } catch {
    return false;
  }
};

export const subscribeToStoredUser = (callback) => {
  const notify = () => callback(getStoredUser());

  window.addEventListener(USER_INFO_EVENT, notify);
  window.addEventListener('storage', notify);

  return () => {
    window.removeEventListener(USER_INFO_EVENT, notify);
    window.removeEventListener('storage', notify);
  };
};
