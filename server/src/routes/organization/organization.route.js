import express from "express";
import * as organizationController from "../../controllers/organization/organization.controller.js";

const Router = express.Router();

Router.post("/register", organizationController.registerOrganization);

export const OrganizationRouter = Router;
