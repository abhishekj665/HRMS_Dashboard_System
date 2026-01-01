export default clearCookie = (res, name) => {
  res.clearCookie(name, {
    httpOnly: true,
    sameSite: "strict",
  });
};
