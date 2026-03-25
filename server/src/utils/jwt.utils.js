import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const jwtSign = (id, role, tenantId = null) => {
  return jwt.sign({ id, role, tenantId }, env.jwt_password, { expiresIn: "1d" });
};

export const jwtAccessSign = (id, role, tenantId = null) => {
  return jwt.sign({ id, role, tenantId }, env.jwt_password, {
    expiresIn: "15m",
  });
};

export default jwtSign;
