import express from "express";
import { refreshAuth, userAuth } from "../../middlewares/auth.middleware.js";

import * as accountController from "../../controllers/user/account.controller.js";
import { allowRoles } from "../../middlewares/roleAuth.middleware.js";

export const accountRouter = express.Router();

accountRouter.use(userAuth);

accountRouter
  .route("/")
  .get(allowRoles("manager", "employee"), accountController.getAccountData)
  .post(
    allowRoles("manager", "employee"),
    refreshAuth,
    accountController.registerAccount,
  );
accountRouter.put(
  "/update",
  allowRoles("manager", "employee"),
  accountController.updateAccount,
);
