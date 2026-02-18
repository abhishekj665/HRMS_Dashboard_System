import { Sequelize } from "sequelize";
import { env } from "./env.js";
import "../models/Associations.model.js";


export const sequelize = new Sequelize(
  env.db_name,
  env.db_user,
  env.db_password,
  {
    host: env.db_host,
    port: Number(env.db_port),
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  },
);

export const closeDB = async () => {
  try {
    await sequelize.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error while closing DB:", error.message);
  }
};

export const connectDB = async () => {
  try {
    await sequelize.authenticate();

    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

export const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true });

    console.log("Tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error.message);
  }
};
