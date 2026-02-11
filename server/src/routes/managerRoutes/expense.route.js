import express from "express";
import * as managerExpenseController from "../../controllers/manager/expense.controller.js";

const Router = express.Router();

Router.get("/expense", managerExpenseController.getAllExpense);
Router.put(
  "/expense/approve/:id",
  managerExpenseController.approveExpenseRequest,
);
Router.put(
  "/expense/reject/:id",
  managerExpenseController.rejectExpenseRequest,
);

export const expenseRouter = Router;
