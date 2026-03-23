import express from "express";
import * as candidateController from "../../controllers/recruitment/candidate.controller.js";


const Router = express.Router();

Router.post("/candidate/register", candidateController.registerCandidate);
Router.get("/candidate/get-by-email", candidateController.getCandidate);
Router.get("/candidate/get-by-job-post/:id", candidateController.getCandidateByJobPost);

export const CandidateRouter = Router;
