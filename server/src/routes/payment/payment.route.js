import express from "express";
import * as paymentController from "../../controllers/payment/payment.controller.js";
import { userAuth } from "../../middlewares/auth.middleware.js";


const router = express.Router();

router.post("/order/create",userAuth, paymentController.createOrder);
router.post("/webhook", paymentController.validateWebHook);

export const PaymentRouter = router;

