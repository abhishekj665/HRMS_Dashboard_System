import STATUS from "../../constants/Status.js";
import { Expenses } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import { User } from "../../models/Associations.model.js";
import { Op } from "sequelize";

export const getAllExpenseDataService = async (managerId) => {
  try {
    let expenseData = await Expenses.findAll({
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["email", "role", "managerId"],
          where: { managerId: managerId },
          required: true,
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["email", "role"],
        },
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

export const approveExpenseRequestService = async (id, admin) => {
  try {
    let expenseData = await Expenses.findByPk(id);

    if (expenseData.status != "pending") {
      return {
        success: false,
        message: "Can not update this request",
      };
    }
    expenseData.status = "approved";
    expenseData.updatedAt = new Date();
    expenseData.adminRemark = "Request Approved";
    expenseData.reviewedBy = admin.id;
    expenseData.reviewedAt = new Date();

    await expenseData.save();

    let data = await Expenses.findByPk(id);

    return {
      success: true,
      data: data,
      userId: data.userId,
      message: "Request Update Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const rejectExpenseRequestService = async (id, admin, adminRemark) => {
  try {
    let expenseData = await Expenses.findByPk(id);

    if (expenseData.status != "pending") {
      return {
        success: false,
        message: "Can not update this request",
      };
    }
    expenseData.status = "rejected";
    expenseData.updatedAt = new Date();
    expenseData.adminRemark = adminRemark;
    expenseData.reviewedBy = admin.id;
    expenseData.reviewedAt = new Date();

    await expenseData.save();

    expenseData = await Expenses.findByPk(id);

    return {
      success: true,
      data: expenseData,
      userId: expenseData.userId,
      message: "Request Update Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
