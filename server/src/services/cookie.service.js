const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

export const setCookie = (res, name, value) => {
  res.cookie(name, value, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearCookie = (res, name) => {
  res.clearCookie(name, cookieOptions);
};
