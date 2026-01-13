import express from "express";
import { userAuth } from "../middlewares/auth.middleware.js";
import * as expensesControllers from "../controllers/user/expenses.controller.js";
import { uploadReceipt } from "../middlewares/upload.js";

const router = express.Router();

router.use(userAuth);

router
  .route("/")
  .get(expensesControllers.getExpenseData)
  .post(uploadReceipt.single("bill"), expensesControllers.createNewExpense);


router
  .route("/:id")
  .put(expensesControllers.updateExpense)
  .delete(expensesControllers.updateExpense);

export const expensesRouter = router;
