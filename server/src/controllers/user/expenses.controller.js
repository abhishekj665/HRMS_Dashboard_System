import { successResponse } from "../../utils/response.utils.js";
import { errorResponse } from "../../utils/response.utils.js";

import * as expensesServices from "../../services/user/expenses.service.js";
import STATUS from "../../config/constants/Status.js";
import { io } from "../../server.js";

import cloudinary from "../../config/cloudinary.js";
import fs from "fs";

export const getExpenseData = async (req, res, next) => {
  try {
    let response = await expensesServices.getExpenseDataService(req.user);
    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.ACCEPTED
      );
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const createNewExpense = async (req, res, next) => {
  try {
    let receiptUrl = null;

    console.log(req.file);

    if (req.file) {
      try {
        const upload = await cloudinary.uploader.upload(req.file.path, {
          folder: "expense-bills",
        });
        receiptUrl = upload.secure_url;
      } finally {
        fs.unlinkSync(req.file.path);
      }
    }

    req.body.receiptUrl = receiptUrl;

    let response = await expensesServices.newExpensesService(
      req.body,
      req.user
    );

    if (response.success) {
      io.to("admin").emit("expenseCreated");
      io.to(`user:${req.user.id}`).emit("expenseCreated");
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    let response = await expensesServices.updateExpenses(
      req.params.id,
      req.user
    );

    if (response.success) {
      io.to("admin").emit("expenseUpdated", {
        message: "Expense updated",
      });

      io.to(`user:${response.userId}`).emit("expenseUpdated", {
        message: "Your expense was updated",
      });

      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.ACCEPTED
      );
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};
