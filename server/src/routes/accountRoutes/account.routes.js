import express from "express";
import { refreshAuth, userAuth } from "../../middlewares/auth.middleware.js";

import * as accountController from "../../controllers/user/account.controller.js";
import { allowRoles } from "../../middlewares/roleAuth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { accountSchema, accountUpdateSchema } from "../../validators/forms.validator.js";

export const accountRouter = express.Router();

accountRouter
  .route("/")
  .get(allowRoles("manager", "employee"), accountController.getAccountData)
  .post(userAuth, validate(accountSchema), accountController.registerAccount);
accountRouter.put("/update", userAuth, validate(accountUpdateSchema), accountController.updateAccount);
