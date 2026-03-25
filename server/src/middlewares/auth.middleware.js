import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const decodeAuthorizedUser = (token, expectedRole = null) => {
  const decoded = jwt.verify(token, env.jwt_password);

  if (expectedRole && decoded.role !== expectedRole) {
    throw new Error(`Access denied. ${expectedRole} only.`);
  }

  return decoded;
};

export const userAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    req.user = decodeAuthorizedUser(token);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export const adminAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "User not verified" });
  try {
    req.user = decodeAuthorizedUser(token, "admin");
    next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};

export const managerAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "User not verified" });
  try {
    req.user = decodeAuthorizedUser(token, "manager");
    next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};

export const refreshAuth = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: "User not verified" });
    req.user = decodeAuthorizedUser(token);
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};
