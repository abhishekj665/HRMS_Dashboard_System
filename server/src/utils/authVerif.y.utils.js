import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, "Abhishek");
    req.user = decoded;
    next();
  } catch {
    return res.status(403).send({ error: "Invalid token" });
  }
};