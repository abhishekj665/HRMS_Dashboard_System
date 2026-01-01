export const setCookie = (res, name, value, options = {}) => {
  const defaultOptions = {
    httpOnly: true,

    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  };

  res.cookie(name, value, { ...defaultOptions, ...options });
};
