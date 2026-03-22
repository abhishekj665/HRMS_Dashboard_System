import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/Associations.model.js";

export const userAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decode = jwt.verify(token, env.jwt_password);

    const user = await User.findByPk(decode.id);

    if (!user || user.isBlocked)
      return res.status(403).json({ message: "Access denied" });

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
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

export const refreshAuth = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: "User not verified" });
    const decode = jwt.verify(token, env.jwt_password);
    req.user = decode;
    next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};
