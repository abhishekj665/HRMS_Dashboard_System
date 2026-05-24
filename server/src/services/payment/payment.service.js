import ExpressError from "../../utils/Error.utils.js";
import razorpayInstance from "../../utils/razorpay.utils.js";
import { sequelize } from "../../config/db.js";
import { Organization, Payment } from "../../models/Associations.model.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import { env } from "../../config/env.js";
import STATUS from "../../constants/Status.js";

const paymentSuccess = async (orderId) => {
  const transaction = await sequelize.transaction();
  try {
    const payment = await Payment.findOne({ where: orderId });
    if (!payment) {
      return {
        success: false,
        message: "Payment not found",
        status: STATUS.NOT_FOUND,
      };
    }

    payment.status = "success";
    await payment.save();

    const organization = await Organization.findOne({
      where: { ownerId: payment.userId },
    });

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
    throw new ExpressError(error.status, error.message);
  }
};

const paymentFailed = async (orderId) => {
  const transacion = await sequelize.transaction();
  try {
    const payment = await Payment.findOne({ where: orderId });

    await payment.update({ status: "failed" }, { transacion });

    await transacion.commit();

    return {
      success: true,
      message: "Payment Failed",
      status: STATUS.OK,
    };
  } catch (error) {
    await transacion.rollback();
    throw new ExpressError(error.status, error.message);
  }
};

export const createOrder = async (data, userId) => {
  const transaction = await sequelize.transaction();
  try {
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
    throw new ExpressError(error.status, error.message);
  }
};

export const validateWebHook = async (webHookSignature, data) => {
  try {
    const isWebHookValidate = await validateWebhookSignature(
      JSON.stringify(data),
      webHookSignature,
      env.RAZORPAY_WEBHOOK_SECRET,
    );

    if (!isWebHookValidate) {
      return {
        success: false,
        message: "WebHook Not Validate",
        status: STATUS.BAD_GATEWAY,
      };
    }

    const paymentDetails = data.payload.payment.entity;

    if (req.body.event === "payment.captured") {
      paymentSuccess(paymentDetails.order_id);
    }

    if (req.body.event === "payment.failed") {
      paymentFailed(paymentDetails.order_id);
    }

    return {
      success: true,
      message: "WebHook Validate",
      status: STATUS.OK,
    };
  } catch (error) {
    throw new ExpressError(error.status, error.message);
  }
};
