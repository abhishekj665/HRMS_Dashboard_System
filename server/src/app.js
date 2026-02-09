import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { userRouter } from "./routes/users.routes.js";
import { globalErrorHandler } from "./middlewares/error.midlleware.js";
import { expensesRouter } from "./routes/expenses.routes.js";
import { accountRouter } from "./routes/account.routes.js";
import { managerRouter } from "./routes/manager.routes.js";
import { attendanceRouter } from "./routes/attendance.routes.js";

import cors from "cors";
import path from "path";
import { env } from "./config/env.js";

const app = express();

const allowList = [env.client_url?.trim()];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowList.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS"));
      }
    },
    credentials: true,
  }),
);
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/manager", managerRouter);
app.use("/expenses", expensesRouter);
app.use("/account", accountRouter);
app.use("/attendance", attendanceRouter);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(globalErrorHandler);

export default app;
