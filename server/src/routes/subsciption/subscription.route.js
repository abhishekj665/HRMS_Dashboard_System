import express from "express";
import * as subsciptionController from "../../controllers/subscription/subscription.controller.js";
import { userAuth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", userAuth, subsciptionController.getSubscription);

export const subscriptionRouter = router;


