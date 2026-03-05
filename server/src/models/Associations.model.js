import User from "./UserModels/user.model.js";
import OTP from "./UserModels/Otp.models.js";
import UserIP from "./UserModels/UserIP.model.js";
import AssetRequest from "./AssetModels/AssestRequest.model.js";
import Asset from "./AssetModels/Asset.model.js";
import UserAsset from "./AssetModels/UserAsset.model.js";
import Expenses from "./UserModels/Expenses.model.js";
import Account from "./UserModels/Account.model.js";
import Attendance from "./AttendanceModels/Attendance.model.js";
import AttendancePolicy from "./AttendanceModels/AttendancePolicy.model.js";
import OvertimePolicy from "./AttendanceModels/OvertimePolicy.js";
import AttendanceRequest from "./AttendanceModels/AttendanceRequest.model.js";
import AttendanceLog from "./AttendanceModels/AttendanceLog.model.js";
import LeaveRequest from "./LeaveModels/LeaveRequest.model.js";
import LeaveBalance from "./LeaveModels/LeaveBalance.model.js";
import LeaveType from "./LeaveModels/LeaveType.model.js";
import LeaveAuditLog from "./LeaveModels/LeaveAuditLog.model.js";
import LeavePolicy from "./LeaveModels/LeavePolicy.model.js";
import LeavePolicyRule from "./LeaveModels/LeavePolicyRule.model.js";
import JobPosting from "./RecruitmentModels/JobPosting.model.js";
import HiringStage from "./RecruitmentModels/HiringStage.model.js";
import ApplicationStageLog from "./RecruitmentModels/ApplicationStageLog.model.js";
import Application from "./RecruitmentModels/Application.model.js";
import Candidate from "./RecruitmentModels/Candidate.model.js";
import Offer from "./RecruitmentModels/Offer.model.js";
import Interview from "./RecruitmentModels/Interview.model.js";
import InterviewFeedback from "./RecruitmentModels/InterviewFeedback.model.js";
import Referral from "./RecruitmentModels/Referral.model.js";
import JobRequisition from "./RecruitmentModels/JobRequisition.model.js";
import InterviewAuditLog from "./RecruitmentModels/InterviewAuditLog.model.js";

// USER ↔ BASIC SECURITY

User.hasMany(UserIP, { foreignKey: "userId" });
UserIP.belongsTo(User, { foreignKey: "userId" });

User.hasMany(OTP, { foreignKey: "userId" });
OTP.belongsTo(User, { foreignKey: "userId" });

User.hasOne(Account, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
Account.belongsTo(User, {
  foreignKey: "userId",
});

// USER ↔ HIERARCHY

User.hasMany(User, {
  as: "workers",
  foreignKey: "managerId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

User.belongsTo(User, {
  as: "manager",
  foreignKey: "managerId",
});

// USER ↔ ASSETS

User.hasMany(AssetRequest, { foreignKey: "userId" });
AssetRequest.belongsTo(User, { foreignKey: "userId" });

User.hasMany(AssetRequest, { foreignKey: "reviewedBy" });
AssetRequest.belongsTo(User, { foreignKey: "reviewedBy", as: "reviewer" });

User.hasMany(UserAsset, { foreignKey: "userId" });
UserAsset.belongsTo(User, { foreignKey: "userId" });

Asset.hasMany(AssetRequest, {
  foreignKey: "assetId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
AssetRequest.belongsTo(Asset, {
  foreignKey: "assetId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

Asset.hasMany(UserAsset, {
  foreignKey: "assetId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
UserAsset.belongsTo(Asset, {
  foreignKey: "assetId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

// USER ↔ EXPENSES

User.hasMany(Expenses, { foreignKey: "userId" });
Expenses.belongsTo(User, { foreignKey: "userId", as: "employee" });

User.hasMany(Expenses, { foreignKey: "reviewedBy" });
Expenses.belongsTo(User, { foreignKey: "reviewedBy", as: "reviewer" });

// USER ↔ ATTENDANCE

User.hasMany(Attendance, {
  as: "employee",
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Attendance.belongsTo(User, {
  foreignKey: "userId",
});

// ATTENDANCE ↔ REQUESTS

Attendance.hasMany(AttendanceRequest, {
  foreignKey: "attendanceId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

AttendanceRequest.belongsTo(Attendance, {
  foreignKey: "attendanceId",
});

User.hasMany(AttendanceRequest, {
  foreignKey: "requestedBy",
  as: "requestsRaised",
});

AttendanceRequest.belongsTo(User, {
  foreignKey: "requestedBy",
  as: "requester",
});

User.hasMany(AttendanceRequest, {
  foreignKey: "reviewedBy",
  as: "approvedRequests",
});

AttendanceRequest.belongsTo(User, {
  foreignKey: "reviewedBy",
  as: "approver",
});

// ATTENDANCE ↔ LOGS

User.hasMany(AttendanceLog, {
  foreignKey: "userId",
  as: "punchLogs",
  onDelete: "CASCADE",
});

AttendanceLog.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Attendance.hasMany(AttendanceLog, {
  foreignKey: "attendanceId",
  as: "logs",
  onDelete: "SET NULL",
});

AttendanceLog.belongsTo(Attendance, {
  foreignKey: "attendanceId",
  as: "attendance",
});

User.hasMany(AttendanceLog, {
  foreignKey: "editedBy",
  as: "editedLogs",
});

AttendanceLog.belongsTo(User, {
  foreignKey: "editedBy",
  as: "editor",
});

// POLICY ↔ USER
AttendancePolicy.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
});

AttendancePolicy.hasMany(User, {
  foreignKey: "attendancePolicyId",
  onUpdate: "CASCADE",
});

User.belongsTo(AttendancePolicy, {
  foreignKey: "attendancePolicyId",
});

// POLICY ↔ OVERTIME

AttendancePolicy.hasOne(OvertimePolicy, {
  foreignKey: "attendancePolicyId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

OvertimePolicy.belongsTo(AttendancePolicy, {
  foreignKey: "attendancePolicyId",
});

// Leave Management Associations -

// Requester

User.hasMany(LeaveRequest, {
  foreignKey: "userId",
  as: "leaveRequests",
  onDelete: "CASCADE",
});

LeaveRequest.belongsTo(User, {
  foreignKey: "userId",
  as: "employee",
});

// approver -

User.hasMany(LeaveRequest, {
  foreignKey: "reviewedBy",
  as: "reviewer",
});

LeaveRequest.belongsTo(User, {
  foreignKey: "reviewedBy",
  as: "reviewer",
});

// User --> Leave Balance

User.hasMany(LeaveBalance, {
  foreignKey: "userId",
  as: "leaveBalances",
});

LeaveBalance.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// LeaveType --> Leave Balance

LeaveType.hasMany(LeaveBalance, {
  foreignKey: "leaveTypeId",
  onDelete: "CASCADE",
});

LeaveBalance.belongsTo(LeaveType, {
  foreignKey: "leaveTypeId",
});

// Leave Type --> Leave Request

LeaveType.hasMany(LeaveRequest, {
  foreignKey: "leaveTypeId",
});

LeaveRequest.belongsTo(LeaveType, {
  foreignKey: "leaveTypeId",
});

// Audit Log

LeaveRequest.hasMany(LeaveAuditLog, {
  foreignKey: "leaveRequestId",
  as: "auditLogs",
  onDelete: "CASCADE",
});

LeaveAuditLog.belongsTo(LeaveRequest, {
  foreignKey: "leaveRequestId",
  as: "leaveRequest",
});

User.hasMany(LeaveAuditLog, {
  foreignKey: "reviewedBy",
  as: "leaveActions",
});

LeaveAuditLog.belongsTo(User, {
  foreignKey: "reviewedBy",
  as: "reviewer",
});

// Policy → Rules
LeavePolicy.hasMany(LeavePolicyRule, {
  foreignKey: "policyId",
  as: "rules",
  onDelete: "CASCADE",
});

LeavePolicyRule.belongsTo(LeavePolicy, {
  foreignKey: "policyId",
  as: "policy",
});

// LeaveType → PolicyRule
LeaveType.hasMany(LeavePolicyRule, {
  foreignKey: "leaveTypeId",
  as: "policyRules",
});

LeavePolicyRule.belongsTo(LeaveType, {
  foreignKey: "leaveTypeId",
  as: "leaveType",
});

// User ---> LeavePOlicy

LeavePolicy.hasMany(User, {
  foreignKey: "leavePolicyId",
  as: "users",
});

User.belongsTo(LeavePolicy, {
  foreignKey: "leavePolicyId",
  as: "leavePolicy",
});

// LeavePolicy --> Leave Balance

LeavePolicy.hasMany(LeaveBalance, {
  foreignKey: "policyId",
  as: "balances",
});

LeaveBalance.belongsTo(LeavePolicy, {
  foreignKey: "policyId",
  as: "policy",
});

// Candidate --> Application

Candidate.hasMany(Application, {
  foreignKey: "candidateId",
  as: "applications",
});

Application.belongsTo(Candidate, {
  foreignKey: "candidateId",
  as: "candidate",
});

// JobPosting ↔ Application

JobPosting.hasMany(Application, {
  foreignKey: "jobPostingId",
  as: "applications",
});

Application.belongsTo(JobPosting, {
  foreignKey: "jobPostingId",
  as: "jobPosting",
});

// HiringStage ↔ Application

HiringStage.hasMany(Application, {
  foreignKey: "currentStageId",
  as: "applications",
});

Application.belongsTo(HiringStage, {
  foreignKey: "currentStageId",
  as: "currentStage",
});

// Application ↔ ApplicationStageLog

Application.hasMany(ApplicationStageLog, {
  foreignKey: "applicationId",
  as: "stageLogs",
});

ApplicationStageLog.belongsTo(Application, {
  foreignKey: "applicationId",
  as: "application",
});

// HiringStage ↔ ApplicationStageLog (from & to)

ApplicationStageLog.belongsTo(HiringStage, {
  foreignKey: "fromStageId",
  as: "fromStage",
});

ApplicationStageLog.belongsTo(HiringStage, {
  foreignKey: "toStageId",
  as: "toStage",
});

// Application ↔ Interview

Application.hasMany(Interview, {
  foreignKey: "applicationId",
  as: "interviews",
});

Interview.belongsTo(Application, {
  foreignKey: "applicationId",
  as: "application",
});

// Interview ↔ InterviewFeedback

Interview.hasOne(InterviewFeedback, {
  foreignKey: "interviewId",
  as: "feedbacks",
});

InterviewFeedback.belongsTo(Interview, {
  foreignKey: "interviewId",
  as: "interview",
});

// Application ↔ Offer (One-to-One)
Application.hasOne(Offer, {
  foreignKey: "applicationId",
  as: "offer",
});

Offer.belongsTo(Application, {
  foreignKey: "applicationId",
  as: "application",
});

// Candidate ↔ Referral

Candidate.hasMany(Referral, {
  foreignKey: "candidateId",
  as: "referrals",
});

Referral.belongsTo(Candidate, {
  foreignKey: "candidateId",
  as: "candidate",
});

// User ↔ Referral

User.hasMany(Referral, {
  foreignKey: "referredById",
  as: "givenReferrals",
});

Referral.belongsTo(User, {
  foreignKey: "referredById",
  as: "referrer",
});

// JobRequisition ↔ JobPosting

JobRequisition.hasOne(JobPosting, {
  foreignKey: "requisitionId",
  as: "jobPosting",
});

JobPosting.belongsTo(JobRequisition, {
  foreignKey: "requisitionId",
  as: "requisition",
});

// JobPosting ↔ HiringStage

JobPosting.hasMany(HiringStage, {
  foreignKey: "jobPostingId",
  as: "stages",
});

HiringStage.belongsTo(JobPosting, {
  foreignKey: "jobPostingId",
  as: "jobPosting",
});

// JobRequisition → createdBy, approvedBy

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

// JobPosting → createdBy

User.hasMany(JobPosting, {
  foreignKey: "createdBy",
  as: "createdJobPostings",
});

JobPosting.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
});

// Application --> RefrredByEmployeeById

User.hasMany(Application, {
  foreignKey: "referredByEmployeeId",
  as: "referredApplications",
});

Application.belongsTo(User, {
  foreignKey: "referredByEmployeeId",
  as: "referredByEmployee",
});

// ApplicationStageLog → changedBy

User.hasMany(ApplicationStageLog, {
  foreignKey: "changedBy",
  as: "stageChanges",
});

ApplicationStageLog.belongsTo(User, {
  foreignKey: "changedBy",
  as: "changedByUser",
  onDelete: "SET NULL",
});

// Interview → interviewerId

User.hasMany(Interview, {
  foreignKey: "interviewerId",
  as: "interviewsTaken",
});

Interview.belongsTo(User, {
  foreignKey: "interviewerId",
  as: "interviewer",
});

//Interview → rescheduledBy

User.hasMany(Interview, {
  foreignKey: "rescheduledBy",
  as: "rescheduledInterviews",
});

Interview.belongsTo(User, {
  foreignKey: "rescheduledBy",
  as: "rescheduledByUser",
});

// InterviewFeedback → submittedBy

User.hasMany(InterviewFeedback, {
  foreignKey: "submittedBy",
  as: "submittedFeedbacks",
});

InterviewFeedback.belongsTo(User, {
  foreignKey: "submittedBy",
  as: "submittedByUser",
});

// Referral → referredById

User.hasMany(Referral, {
  foreignKey: "referredById",
  as: "referralsGiven",
});

Referral.belongsTo(User, {
  foreignKey: "referredById",
  as: "referralReferrer",
});

// Offer → approvedBy

User.hasMany(Offer, {
  foreignKey: "approvedBy",
  as: "approvedOffers",
});

Offer.belongsTo(User, {
  foreignKey: "approvedBy",
  as: "approvedByUser",
});

// Interview - InterviewLogs

Interview.hasMany(InterviewAuditLog, {
  foreignKey: "interviewId",
  as: "auditLogs",
});

InterviewAuditLog.belongsTo(Interview, {
  foreignKey: "interviewId",
});

export {
  User,
  OTP,
  UserIP,
  AssetRequest,
  Asset,
  UserAsset,
  Account,
  Expenses,
  Attendance,
  AttendancePolicy,
  OvertimePolicy,
  AttendanceLog,
  AttendanceRequest,
  LeaveAuditLog,
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  LeavePolicy,
  LeavePolicyRule,
  JobPosting,
  HiringStage,
  ApplicationStageLog,
  Application,
  Candidate,
  Offer,
  Interview,
  InterviewFeedback,
  Referral,
  JobRequisition,
  InterviewAuditLog
};
