import STATUS from "../../config/constants/Status.js";
import { Account, Expenses } from "../../models/index.model.js";
import ExpressError from "../../utils/Error.utils.js";
import { successResponse } from "../../utils/response.utils.js";
import { User } from "../../models/index.model.js";
import bcrypt from "bcrypt";

export const getExpenseDataService = async (user) => {
  try {
    let isAccount = await Account.findOne({ where: { userId: user.id } });

    if (!isAccount) {
      return {
        success: false,
        message: "You don't have an account, Firstly create your account",
      };
    }
    let expenseData = await Expenses.findAll({
      where: { userId: user.id },
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
        message: "Expense Data Not fetched",
      };
    }
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const newExpensesService = async (data, user) => {
  try {
    let expenseData = await Account.findOne({ where: { userId: user.id } });

    let { amount, expenseDate, pin, receiptUrl } = data;

    console.log(data);

    let verify = await bcrypt.compare(String(pin), expenseData.pin);

    if (!verify) {
      return {
        success: false,
        message: "Pin is incrypted",
      };
    }

    let expense = await Expenses.create({
      userId: user.id,
      amount: amount,
      expenseDate: expenseDate,
      receiptUrl: receiptUrl,
    });
    if (expense) {
      return {
        success: true,
        data: expense,
        message: "Expense Data Created",
      };
    } else {
      return {
        success: false,
        message: "Expense Create Unsuccessfull",
      };
    }
  } catch (error) {
    throw new ExpressError(STATUS.NOT_ACCEPTABLE, error.message);
  }
};

export const updateExpenses = async (id, data) => {
  try {
    let expenseData = await Expenses.findByPk(id);

    if (expenseData.status != "pending") {
      return {
        success: false,
        message: "You can't change this expenseData",
      };
    }
    let expense = await Expenses.update({ ...data }, { where: { id: id } });

    if (expense) {
      return {
        success: true,
        data: expenseData,
        message: "Expense Data updated",
      };
    } else {
      return {
        success: false,
        message: "Expense Data Not Update",
      };
    }
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
