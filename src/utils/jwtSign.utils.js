import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const jwtSign = (id, role) => {
  return jwt.sign({ id, role }, env.jwt_password, { expiresIn: "1d" });
};

export default jwtSign;
