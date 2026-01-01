import { Sequelize } from "sequelize";
import { env } from "./env.js";

const sequelize = new Sequelize(env.db_name, env.db_user, env.db_password, {
  host: env.db_host,
  dialect: "mysql",
  logging: false,
});



export default sequelize;
