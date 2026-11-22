import express from "express";

import * as expensesControllers from "../../controllers/user/expenses.controller.js";
import { uploadReceipt } from "../../middlewares/upload.js";
import { refreshAuth, userAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { expenseSchema } from "../../validators/forms.validator.js";

const Router = express.Router();

Router.get("/expenses",userAuth, expensesControllers.getExpenseData);
Router.post(
  "/expenses",
  uploadReceipt.single("bill"),
  userAuth,
  validate(expenseSchema),
  expensesControllers.createNewExpense,
);

Router.put("/expenses/:id", refreshAuth, expensesControllers.updateExpense);

export const expenseRouter = Router;
