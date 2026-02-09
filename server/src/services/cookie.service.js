export const setCookie = (res, name, value) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

export const clearCookie = (res, name) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie(name, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  });
};
