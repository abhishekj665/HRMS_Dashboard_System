import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT,
  secret: process.env.SECRET,
  db_host: process.env.DB_HOST,
  db_password: process.env.DB_PASSWORD,
  db_user: process.env.DB_USER,
  db_name: process.env.DB_NAME,
  jwt_password: process.env.JWT_PASSWORD,
  mail_user: process.env.MAIL_USER,
  mail_pass: process.env.MAIL_PASS,
  geo_apikey: process.env.GEO_APIKEY,
};
