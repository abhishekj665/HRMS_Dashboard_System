export const AUTH_SESSION_CHANGED_KEY = "hrms-auth-session-changed";

// This stores only a timestamp signal. Authentication data remains in the HttpOnly cookie.
export const notifyAuthSessionChanged = () => {
  try {
    window.localStorage.setItem(
      AUTH_SESSION_CHANGED_KEY,
      `${Date.now()}-${Math.random()}`,
    );
  } catch {
    // Storage can be unavailable in private browsing or when browser policy blocks it.
  }
};
