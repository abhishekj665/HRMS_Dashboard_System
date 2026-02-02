import bcrypt from "bcrypt";
import { sequelize } from "./config/db.js";
import { User } from "./models/Associations.model.js";

async function seed() {
  await sequelize.authenticate();

  const adminPass = await bcrypt.hash("Admin@123", 10);
  const managerPass = await bcrypt.hash("Manager@123", 10);
  const userPass = await bcrypt.hash("User@123", 10);


  await User.create({
    email: "admin@company.com",
    password: adminPass,
    role: "admin",
    isVerfied: true
  });

  await User.create({
    email: "manager@company.com",
    password: managerPass,
    role: "manager",
    isVerfied: true
  });

  await User.create({
    email: "user@company.com",
    password: userPass,
    role: "user",
    isVerfied: true
  });

  console.log("Seed users created");
  process.exit();
}

seed();
