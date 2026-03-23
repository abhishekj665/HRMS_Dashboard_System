import express from "express";

import * as adminExpenseController from "../../controllers/admin/expenses.controller.js";
import { refreshAuth } from "../../middlewares/auth.middleware.js";

const Router = express.Router();


Router.get("/expense", adminExpenseController.getAllExpense);
Router.put(
  "/expense/approve/:id",
  refreshAuth,
  adminExpenseController.approveExpenseRequest,
);
Router.put("/expense/reject/:id", refreshAuth, adminExpenseController.rejectExpenseRequest);

export const expenseRouter = Router;
