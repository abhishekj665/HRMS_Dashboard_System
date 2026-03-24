import User from "../UserModels/user.model.js";
import JobPosting from "../RecruitmentModels/JobPosting.model.js";
import HiringStage from "../RecruitmentModels/HiringStage.model.js";
import ApplicationStageLog from "../RecruitmentModels/ApplicationStageLog.model.js";
import Application from "../RecruitmentModels/Application.model.js";
import Candidate from "../RecruitmentModels/Candidate.model.js";
import Offer from "../RecruitmentModels/Offer.model.js";
import Interview from "../RecruitmentModels/Interview.model.js";
import InterviewFeedback from "../RecruitmentModels/InterviewFeedback.model.js";
import Referral from "../RecruitmentModels/Referral.model.js";
import JobRequisition from "../RecruitmentModels/JobRequisition.model.js";
import InterviewAuditLog from "../RecruitmentModels/InterviewAuditLog.model.js";

Candidate.hasMany(Application, {
  foreignKey: "candidateId",
  as: "applications",
});

Application.belongsTo(Candidate, {
  foreignKey: "candidateId",
  as: "candidate",
});

JobPosting.hasMany(Application, {
  foreignKey: "jobPostingId",
  as: "applications",
});

Application.belongsTo(JobPosting, {
  foreignKey: "jobPostingId",
  as: "jobPosting",
});

HiringStage.hasMany(Application, {
  foreignKey: "currentStageId",
  as: "applications",
});

Application.belongsTo(HiringStage, {
  foreignKey: "currentStageId",
  as: "currentStage",
});

Application.hasMany(ApplicationStageLog, {
  foreignKey: "applicationId",
  as: "stageLogs",
});

ApplicationStageLog.belongsTo(Application, {
  foreignKey: "applicationId",
  as: "application",
});

ApplicationStageLog.belongsTo(HiringStage, {
  foreignKey: "fromStageId",
  as: "fromStage",
});

ApplicationStageLog.belongsTo(HiringStage, {
  foreignKey: "toStageId",
  as: "toStage",
});

Application.hasMany(Interview, {
  foreignKey: "applicationId",
  as: "interviews",
});

Interview.belongsTo(Application, {
  foreignKey: "applicationId",
  as: "application",
});

Interview.hasOne(InterviewFeedback, {
  foreignKey: "interviewId",
  as: "feedbacks",
});

InterviewFeedback.belongsTo(Interview, {
  foreignKey: "interviewId",
  as: "interview",
});

Application.hasOne(Offer, {
  foreignKey: "applicationId",
  as: "offer",
});

Offer.belongsTo(Application, {
  foreignKey: "applicationId",
  as: "application",
});

Candidate.hasMany(Referral, {
  foreignKey: "candidateId",
  as: "referrals",
});

Referral.belongsTo(Candidate, {
  foreignKey: "candidateId",
  as: "candidate",
});

User.hasMany(Referral, {
  foreignKey: "referredById",
  as: "givenReferrals",
});

Referral.belongsTo(User, {
  foreignKey: "referredById",
  as: "referrer",
});

JobRequisition.hasOne(JobPosting, {
  foreignKey: "requisitionId",
  as: "jobPosting",
});

JobPosting.belongsTo(JobRequisition, {
  foreignKey: "requisitionId",
  as: "requisition",
});

JobPosting.hasMany(HiringStage, {
  foreignKey: "jobPostingId",
  as: "stages",
});

HiringStage.belongsTo(JobPosting, {
  foreignKey: "jobPostingId",
  as: "jobPosting",
});

User.hasMany(JobRequisition, {
  foreignKey: "createdBy",
  as: "createdRequisitions",
});

JobRequisition.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
});

User.hasMany(JobRequisition, {
  foreignKey: "approvedBy",
  as: "approvedRequisitions",
});

JobRequisition.belongsTo(User, {
  foreignKey: "approvedBy",
  as: "approver",
});

User.hasMany(JobPosting, {
  foreignKey: "createdBy",
  as: "createdJobPostings",
});

JobPosting.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
});

User.hasMany(Application, {
  foreignKey: "referredByEmployeeId",
  as: "referredApplications",
});

Application.belongsTo(User, {
  foreignKey: "referredByEmployeeId",
  as: "referredByEmployee",
});

User.hasMany(ApplicationStageLog, {
  foreignKey: "changedBy",
  as: "stageChanges",
});

ApplicationStageLog.belongsTo(User, {
  foreignKey: "changedBy",
  as: "changedByUser",
  onDelete: "SET NULL",
});

User.hasMany(Interview, {
  foreignKey: "interviewerId",
  as: "interviewsTaken",
});

Interview.belongsTo(User, {
  foreignKey: "interviewerId",
  as: "interviewer",
});

User.hasMany(Interview, {
  foreignKey: "rescheduledBy",
  as: "rescheduledInterviews",
});

Interview.belongsTo(User, {
  foreignKey: "rescheduledBy",
  as: "rescheduledByUser",
});

User.hasMany(InterviewFeedback, {
  foreignKey: "submittedBy",
  as: "submittedFeedbacks",
});

InterviewFeedback.belongsTo(User, {
  foreignKey: "submittedBy",
  as: "submittedByUser",
});

User.hasMany(Referral, {
  foreignKey: "referredById",
  as: "referralsGiven",
});

Referral.belongsTo(User, {
  foreignKey: "referredById",
  as: "referralReferrer",
});

User.hasMany(Offer, {
  foreignKey: "approvedBy",
  as: "approvedOffers",
});

Offer.belongsTo(User, {
  foreignKey: "approvedBy",
  as: "approvedByUser",
});

Interview.hasMany(InterviewAuditLog, {
  foreignKey: "interviewId",
  as: "auditLogs",
});

InterviewAuditLog.belongsTo(Interview, {
  foreignKey: "interviewId",
});
