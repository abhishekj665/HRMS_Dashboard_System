import express from "express";
import { adminAuth, refreshAuth } from "../../middlewares/auth.middleware.js";

import * as OfferController from "../../controllers/recruitment/offer.controller.js";

const Router = express.Router();

Router.post("/offer/accept/:token", OfferController.validateOfferToken);

Router.post("/offer/generate/:id", adminAuth,refreshAuth, OfferController.createOffer);

export const OfferRoute = Router;
