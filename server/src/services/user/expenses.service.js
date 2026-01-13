import STATUS from "../../constants/Status.js";
import { Account, Expenses } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";

import { User } from "../../models/Associations.model.js";
import bcrypt from "bcrypt";

export const getExpenseDataService = async () => {
  try {
    let expenseData = await Expenses.findAll({
      include: [
        { model: User, as: "employee", attributes: ["email"] },
        { model: User, as: "reviewer", attributes: ["email", "role"] },
      ],
      order: [["updatedAt", "DESC"]],
    });

    if (expenseData) {
      return {
        success: true,
        data: expenseData,
        message: "Expense Data Fetched Successfully",
      };
    } else {
      return {
        success: false,
        message: "No Expense Data Fetched",
      };
    }
  } catch (error) {
    throw new ExpressError(STATUS.BAD_GATEWAY, error.message);
  }
};

export const newExpensesService = async (data, user) => {
  try {
    const expenseAccount = await Account.findOne({
      where: { userId: user.id },
    });

    if (!expenseAccount) {
      return {
        success: false,
        code: "NO_ACCOUNT",
        message: "Please create account first",
      };
    }

    let { amount, expenseDate, pin, receiptUrl } = data;

    const verify = await bcrypt.compare(String(pin), expenseAccount.pin);

    if (!verify) {
      return {
        success: false,
        message: "Invalid PIN",
      };
    }

    const expense = await Expenses.create({
      userId: user.id,
      amount,
      expenseDate,
      receiptUrl,
      status: "pending",
    });

    if (!expense) {
      return {
        success: false,
        message: "Expense creation failed",
      };
    }

    return {
      success: true,
      data: expense,
      message: "Expense created successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.NOT_ACCEPTABLE, error.message);
  }
};

export const updateExpenses = async (expenseId, user, remark = null) => {
  try {
    if (user.role !== "manager" && user.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const expense = await Expenses.findByPk(expenseId);

    if (!expense) {
      return {
        success: false,
        message: "Expense not found",
      };
    }

    let updateData = {
      reviewedAt: new Date(),
    };

    if (user.action === "approve") {
      updateData.status = "approved";
    }

    if (user.action === "reject") {
      updateData.status = "rejected";
      updateData.adminRemark = remark;
    }

    await Expenses.update(updateData, {
      where: { id: expenseId },
    });

    return {
      success: true,
      data: expenseId,
      userId: expense.userId,
      message: "Expense updated successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.NOT_ACCEPTABLE, error.message);
  }
};
