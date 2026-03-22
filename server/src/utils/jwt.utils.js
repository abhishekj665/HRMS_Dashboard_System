import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const jwtSign = (id, role) => {
  return jwt.sign({ id, role }, env.jwt_password, { expiresIn: "1d" });
};

export const jwtAccessSign = (id, role) => {
  return jwt.sign({ id, role }, env.jwt_password, { expiresIn: "15m" });
};

export default jwtSign;
