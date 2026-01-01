import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const auth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "User not verified" });

  try {
    const decode = jwt.verify(token, env.jwt_password);
    req.user = decode;
    next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};
