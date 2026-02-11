import express from "express";

import * as expensesControllers from "../../controllers/user/expenses.controller.js";
import { uploadReceipt } from "../../middlewares/upload.js";

const Router = express.Router();

Router.get("/expenses", expensesControllers.getExpenseData);
Router.post(
  "/expenses",
  uploadReceipt.single("bill"),
  expensesControllers.createNewExpense,
);

Router.put("/expenses/:id", expensesControllers.updateExpense);
Router.delete("/expenses/:id", expensesControllers.updateExpense);

export const expenseRouter = Router;
