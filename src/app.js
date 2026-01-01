import express from "express";
import cookieParser from "cookie-parser";
import {authRouter} from "./routes/auth.routes.js";
import {adminRouter} from "./routes/admin.routes.js";
import {userRouter} from "./routes/users.routes.js";
import { globalErrorHandler } from "./middlewares/error.midlleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);

app.use(globalErrorHandler);

export default app;
