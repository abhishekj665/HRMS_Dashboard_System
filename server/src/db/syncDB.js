import sequelize from "../config/db.js";
import { User } from "../models/index.model.js";

export const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true });

    console.log("Tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error.message);
  }
};
