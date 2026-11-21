import express from "express";
import * as subsciptionController from "../../controllers/subscription/subscription.controller.js";
import { userAuth, adminAuth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/plans", userAuth, subsciptionController.getPlans);
router.get("/", userAuth, adminAuth, subsciptionController.getSubscription);


export const subscriptionRouter = router;


