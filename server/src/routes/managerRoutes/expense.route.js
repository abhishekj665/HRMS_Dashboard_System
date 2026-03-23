import express from "express";
import * as managerExpenseController from "../../controllers/manager/expense.controller.js";
import { refreshAuth } from "../../middlewares/auth.middleware.js";

const Router = express.Router();

Router.get("/expense", managerExpenseController.getAllExpense);
Router.put(
  "/expense/approve/:id",
  refreshAuth,
  managerExpenseController.approveExpenseRequest,
);
Router.put(
  "/expense/reject/:id",
  refreshAuth,
  managerExpenseController.rejectExpenseRequest,
);

export const expenseRouter = Router;
