export const setCookie = (res, name, value) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearCookie = (res, name) => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
};
