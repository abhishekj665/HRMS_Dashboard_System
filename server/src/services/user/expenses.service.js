import STATUS from "../../constants/Status.js";
import { Account, Expenses } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";

import { User } from "../../models/Associations.model.js";
import bcrypt from "bcrypt";
import { sequelize } from "../../config/db.js";

import { expenseMailToManagerTemplate } from "../../utils/mailTemplate.utils.js";
import { now } from "sequelize/lib/utils";
import { sendMail } from "../../config/otpService.js";

export const getExpenseDataService = async (id) => {
  try {
    let expenseAccount = await Account.findOne({
      where: { userId: id },
    });

    if (!expenseAccount) {
      return {
        success: false,
        message: "Please create account first",
      };
    }

    let expenseData = await Expenses.findAll({
      where: { userId: id },
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
  const transaction = await sequelize.transaction();
  let committed = false;

  try {
    const expenseAccount = await Account.findOne({
      where: { userId: user.id },
      transaction,
    });

    if (!expenseAccount) {
      throw new Error("Please create account first");
    }

    const { amount, expenseDate, pin, receiptUrl } = data;

    const verify = await bcrypt.compare(String(pin), expenseAccount.pin);
    if (!verify) throw new Error("Invalid PIN");

    const userData = await User.findOne({
      where: { id: user.id },
      attributes: ["managerId", "email", "first_name"],
      include: [{ model: User, as: "manager" }],
      transaction,
    });

    const expenseDateObj = new Date(expenseDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    expenseDateObj.setHours(0, 0, 0, 0);

    if (expenseDateObj > today) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Expense date cannot be in the future",
      );
    }

    if (expenseDate < new Date())
      throw new ExpressError(STATUS.BAD_REQUEST, "Invalid Expense Date");
    const expense = await Expenses.create(
      {
        userId: user.id,
        amount,
        expenseDate,
        receiptUrl,
        status: "pending",
      },
      { transaction },
    );

    await transaction.commit();
    committed = true;

    try {
      const html = expenseMailToManagerTemplate({
        managerName:
          userData.manager.first_name || userData.manager.email.split("@")[0],

        userName: userData.first_name || userData.email.split("@")[0],
        userEmail: userData.email,
        billUrl: receiptUrl,
        amount,
        date: expenseDate,
        time: new Date().toLocaleTimeString("en-IN"),
        category: "Expense",
      });

      sendMail(userData.manager.email, "New Expense Request", html);
    } catch (mailErr) {
      console.error("Mail failed:", mailErr);
    }

    return {
      success: true,
      data: expense,
      message: "Expense created successfully",
    };
  } catch (error) {
    if (!committed) {
      try {
        await transaction.rollback();
      } catch {}
    }
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
