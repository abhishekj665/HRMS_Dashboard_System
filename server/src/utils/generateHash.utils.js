import bcrypt from "bcrypt";

export const generateHash = async (value) => {
  return await bcrypt.hash(value, 10);
};
