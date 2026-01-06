import sequelize from "../src/config/db.js";

export const closeDB = async () => {
  try {
    await sequelize.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error while closing DB:", error.message);
  }
};
