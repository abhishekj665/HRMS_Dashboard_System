import ExpressError from "../../utils/Error.utils.js";
import razorpayInstance from "../../utils/razorpay.utils.js";
import { sequelize } from "../../config/db.js";
import {
  Organization,
  Payment,
  Subscription,
} from "../../models/Associations.model.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import { env } from "../../config/env.js";
import STATUS from "../../constants/Status.js";

const paymentSuccess = async (orderId) => {
  const transaction = await sequelize.transaction();
  try {
    const payment = await Payment.findOne({
      where: { orderId: orderId, status: "created" },
    });

    if (!payment) {
      const processedPayment = await Payment.findOne({
        where: { orderId: orderId, status: "captured" },
      });
      if (processedPayment) {
        await transaction.commit();
        return {
          success: true,
          message: "Payment already processed",
          status: STATUS.OK,
        };
      }

      return {
        success: false,
        message: "Payment not found",
        status: STATUS.NOT_FOUND,
      };
    }

    payment.status = "captured";
    await payment.save({ transaction: transaction });

    const organization = await Organization.findOne({
      where: { ownerId: payment.userId },
    });

    if (!organization) {
      return {
        success: false,
        message: "Organization not found",
        status: STATUS.NOT_FOUND,
      };
    }

    

    const subscription = await Subscription.create(
      {
        name: organization.name,
        tenantId: organization.id,
        planId: payment.planId,
        isActive: true,
      },
      { transaction },
    );

    

    organization.subscriptionId = subscription.id;
    await organization.save({ transaction });

    await transaction.commit();

    return {
      success: true,
      message: "Payment Success",
      status: STATUS.OK,
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(
      Number.isInteger(error?.statusCode)
        ? error.statusCode
        : STATUS.BAD_REQUEST,
      error.message,
    );
  }
};

const paymentFailed = async (orderId) => {
  const transaction = await sequelize.transaction();
  try {
    const payment = await Payment.findOne({
      where: { orderId: orderId, status: "pending" },
    });
    if (!payment) {
      return {
        success: false,
        message: "Payment not found",
        status: STATUS.NOT_FOUND,
      };
    }

    await payment.update({ status: "failed" }, { transaction });

    await transaction.commit();

    return {
      success: true,
      message: "Payment Failed",
      status: STATUS.OK,
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(
      Number.isInteger(error?.statusCode)
        ? error.statusCode
        : STATUS.BAD_REQUEST,
      error.message,
    );
  }
};

export const createOrder = async (data, userId) => {
  const transaction = await sequelize.transaction();
  try {
    const isValidPlanId =
      typeof data?.planId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        data.planId,
      );

    if (!isValidPlanId) {
      throw new ExpressError(STATUS.BAD_REQUEST, "planId is required");
    }

    const amount = parseInt(data.amount) * 100;

    const order = await razorpayInstance.orders.create({
      amount: amount,
      currency: "INR",
      partial_payment: false,
      notes: {
        firstname: "value1",
        lastname: "value2",
      },
    });

    const payment = await Payment.create(
      {
        orderId: order.id,
        userId: userId,
        planId: data.planId,
        amount: data.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        notes: order.notes,
      },
      {
        transaction,
      },
    );

    await transaction.commit();

    return {
      success: true,
      data: {
        id: order.id,
        userId: payment.userId,
        amount: order.amount,
        currency: order.currency,
      },
      message: "Payment Order created successfully",
      status: 200,
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(
      Number.isInteger(error?.statusCode)
        ? error.statusCode
        : STATUS.BAD_REQUEST,
      error.message,
    );
  }
};

export const validateWebHook = async (webHookSignature, rawBody) => {
  try {
    const isWebHookValidate = await validateWebhookSignature(
      rawBody,
      webHookSignature,
      env.razorpay_webhook_secret,
    );

    if (!isWebHookValidate) {
      return {
        success: false,
        message: "WebHook Not Validate",
        status: STATUS.BAD_GATEWAY,
      };
    }
    const data = JSON.parse(rawBody.toString());

    const paymentDetails = data?.payload?.payment?.entity;
    if (!paymentDetails?.order_id) {
      return {
        success: false,
        message: "Invalid webhook payload",
        status: STATUS.BAD_REQUEST,
      };
    }

    if (data.event === "payment.captured") {
      await paymentSuccess(paymentDetails.order_id);
    }

    if (data.event === "payment.failed") {
      await paymentFailed(paymentDetails.order_id);
    }

    return {
      success: true,
      message: "WebHook Validate",
      status: STATUS.OK,
    };
  } catch (error) {
    throw new ExpressError(
      Number.isInteger(error?.statusCode)
        ? error.statusCode
        : STATUS.BAD_REQUEST,
      error.message,
    );
  }
};
