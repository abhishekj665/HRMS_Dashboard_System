import STATUS from "../../constants/Status.js";
import { Expenses } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import { User } from "../../models/Associations.model.js";
import { Op } from "sequelize";
import { expenseApprovedMailTemplate, expenseRejectedMailTemplate } from "../../utils/mailTemplate.utils.js";
import { sendMail } from "../../config/otpService.js";
import {
  assertSameTenant,
  requireTenantId,
} from "../../utils/tenant.utils.js";

export const getAllExpenseDataService = async (manager) => {
  try {
    const tenantId = requireTenantId(manager);
    let expenseData = await Expenses.findAll({
      where: { tenantId },
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["email", "role", "managerId"],
          where: { managerId: manager.id, tenantId },
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

export const approveExpenseRequestService = async (id, data, manager) => {
  try {
    const tenantId = requireTenantId(manager);
    let expenseData = await Expenses.findByPk(id);
    assertSameTenant(expenseData, tenantId, "Expense request");

    const approvedAmount = Number(data.approvedAmount);

    if (expenseData.status != "pending") {
      return {
        success: false,
        message: "Can not update this request",
      };
    }
    if (expenseData.amount < approvedAmount || approvedAmount < 0) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You can't approved this much amount",
      );
    }
    expenseData.status = "approved";
    expenseData.updatedAt = new Date();
    expenseData.adminRemark = data.remark;
    expenseData.reviewedBy = manager.id;
    expenseData.reviewedAt = new Date();
    expenseData.approvedAmount = approvedAmount;

    await expenseData.save();

    const userExpenseData = await Expenses.findByPk(id);

    const user = await User.findByPk(userExpenseData.userId, {
      include: [{ model: User, as: "manager" }],
    });

    const html = expenseApprovedMailTemplate({
      userName: user.first_name || user.email.split("@")[0],
      amountRequested: expenseData.amount,
      amountApproved: data.approvedAmount,
      remark: data.remark,
      date: expenseData.expenseDate,
      managerName: user.manager.first_name || user.manager.email.split("@")[0],
    });

    sendMail(user.manager.email, "Expense Approved", html);

    return {
      success: true,
      data: userExpenseData,
      userId: userExpenseData.userId,
      message: "Request Update Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const rejectExpenseRequestService = async (id, manager, managerRemark) => {
  try {
    const tenantId = requireTenantId(manager);
    let expenseData = await Expenses.findByPk(id);
    assertSameTenant(expenseData, tenantId, "Expense request");

    if (expenseData.status != "pending") {
      return {
        success: false,
        message: "Can not update this request",
      };
    }
    expenseData.status = "rejected";
    expenseData.updatedAt = new Date();
    expenseData.adminRemark = managerRemark;
    expenseData.reviewedBy = manager.id;
    expenseData.reviewedAt = new Date();

    await expenseData.save();

    const userExpenseData = await Expenses.findByPk(id);

    const user = await User.findByPk(userExpenseData.userId, {
      include: [{ model: User, as: "manager" }],
    });

    const html = expenseRejectedMailTemplate({
      userName: user.first_name || user.email.split("@")[0],
      amountRequested: expenseData.amount,
      remark: managerRemark,
      date: expenseData.expenseDate,
      managerName: user.manager.first_name || user.manager.email.split("@")[0],

    })

    sendMail(user.manager.email, "Expense Rejected", html);


    return {
      success: true,
      data: userExpenseData,
      userId: userExpenseData.userId,
      message: "Request Update Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
