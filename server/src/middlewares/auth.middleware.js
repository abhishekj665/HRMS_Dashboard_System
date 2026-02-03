import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const userAuth = (req, res, next) => {
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

export const adminAuth = (req, res, next) => {
  
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "User not verified" });
  try {
    const decode = jwt.verify(token, env.jwt_password);
    if (decode.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    req.user = decode;
    next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};


export const managerAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "User not verified" });
  try {
    const decode = jwt.verify(token, env.jwt_password);
    if (decode.role !== "manager") {
      return res.status(403).json({ message: "Access denied. Manager only." });
    }
    req.user = decode;
    next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};

