import express from "express";

import * as adminExpenseController from "../../controllers/admin/expenses.controller.js";

const Router = express.Router();


Router.get("/expense", adminExpenseController.getAllExpense);
Router.put(
  "/expense/approve/:id",
  adminExpenseController.approveExpenseRequest,
);
Router.put("/expense/reject/:id", adminExpenseController.rejectExpenseRequest);

export const expenseRouter = Router;
