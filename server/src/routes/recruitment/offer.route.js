import express from "express";
import { adminAuth } from "../../middlewares/auth.middleware.js";

import * as OfferController from "../../controllers/recruitment/offer.controller.js";

const Router = express.Router();

Router.post("/offer/generate/:id", adminAuth, OfferController.createOffer);

export const OfferRoute = Router;
