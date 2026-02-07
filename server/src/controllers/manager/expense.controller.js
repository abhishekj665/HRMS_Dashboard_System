import STATUS from "../../constants/Status.js";
import * as expensesService from "../../services/manager/expense.service.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";
import { io } from "../../server.js";

export const getAllExpense = async (req, res, next) => {
  try {
    let response = await expensesService.getAllExpenseDataService(req.user.id);

    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const approveExpenseRequest = async (req, res, next) => {
  try {
    let response = await expensesService.approveExpenseRequestService(
      req.params.id,
      req.user
    );

    if (response.success) {
      io.to("manager").emit("expenseUpdated", {
        message: "Expense status updated",
      });

      io.to("admin").emit("expenseUpdated", {
        message: "Expense status updated",
      });

      io.to(`user:${response.userId}`).emit("expenseUpdated", {
        message: "Your expense status updated",
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

export const rejectExpenseRequest = async (req, res, next) => {
  try {
    let response = await expensesService.rejectExpenseRequestService(
      req.params.id,
      req.user,
      req.body.adminRemark
    );

    if (response.success) {
      io.to("manager").emit("expenseUpdated", {
        message: "Expense status updated",
      });

      io.to("admin").emit("expenseUpdated", {
        message: "Expense status updated",
      });

      io.to(`user:${response.userId}`).emit("expenseUpdated", {
        message: "Your expense status updated",
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
