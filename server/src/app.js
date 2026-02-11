import express from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/authRoutes/auth.routes.js";
import { adminRouter } from "./routes/adminRoutes/admin.routes.js";
import { userRouter } from "./routes/userRoutes/users.routes.js";
import { globalErrorHandler } from "./middlewares/error.midlleware.js";
import { accountRouter } from "./routes/accountRoutes/account.routes.js";
import { managerRouter } from "./routes/managerRoutes/manager.routes.js";
import { attendanceRouter } from "./routes/attendanceRoutes/attendance.routes.js";
import { attendancePolicyRouter } from "./routes/attendanceRoutes/attendancePolicy.routes.js";

import cors from "cors";
import path from "path";
import { env } from "./config/env.js";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = ["http://localhost:5173", env.client_url?.trim()];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/manager", managerRouter);

app.use("/account", accountRouter);
app.use("/attendance", attendanceRouter);
app.use("/attendance-policy", attendancePolicyRouter);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(globalErrorHandler);

export default app;
