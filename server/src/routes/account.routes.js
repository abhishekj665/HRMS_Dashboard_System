import express from "express";
import { auth } from "../middlewares/auth.middleware.js";

import * as accountController from "../controllers/user/account.controller.js";

export const accountRouter = express.Router();

accountRouter.use(auth);

accountRouter
  .route("/")
  .get(accountController.getAccountData)
  .post(accountController.registerAccount);
accountRouter.put("/update", accountController.updateAccount);
