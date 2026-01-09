import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import * as expensesControllers from "../controllers/user/expenses.controller.js";
import { uploadReceipt } from "../middlewares/upload.js";

const router = express.Router();

router.use(auth);

router
  .route("/")
  .get(expensesControllers.getExpenseData)
  .post(uploadReceipt.single("bill"), expensesControllers.createNewExpense);


router
  .route("/:id")
  .put(expensesControllers.updateExpense)
  .delete(expensesControllers.updateExpense);

export const expensesRouter = router;
