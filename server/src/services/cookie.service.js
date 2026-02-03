export const clearCookie = (res, name) => {
  res.clearCookie(name, {
    httpOnly: true,
    sameSite: "strict",
  });
};

export const setCookie = (res, name, value, options = {}) => {
  const isProd = process.env.NODE_ENV === "production";

  const defaultOptions = {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 24 * 60 * 60 * 1000,
  };

  res.cookie(name, value, { ...defaultOptions, ...options });
};
