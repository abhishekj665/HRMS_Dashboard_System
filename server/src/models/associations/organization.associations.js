import User from "../UserModels/user.model.js";
import UserIP from "../UserModels/UserIP.model.js";
import AssetRequest from "../AssetModels/AssestRequest.model.js";
import Asset from "../AssetModels/Asset.model.js";
import UserAsset from "../AssetModels/UserAsset.model.js";
import Expenses from "../UserModels/Expenses.model.js";
import Account from "../UserModels/Account.model.js";
import Attendance from "../AttendanceModels/Attendance.model.js";
import AttendancePolicy from "../AttendanceModels/AttendancePolicy.model.js";
import AttendanceRequest from "../AttendanceModels/AttendanceRequest.model.js";
import AttendanceLog from "../AttendanceModels/AttendanceLog.model.js";
import Holiday from "../AttendanceModels/Holiday.model.js";
import LeaveRequest from "../LeaveModels/LeaveRequest.model.js";
import LeaveBalance from "../LeaveModels/LeaveBalance.model.js";
import LeaveType from "../LeaveModels/LeaveType.model.js";
import LeaveAuditLog from "../LeaveModels/LeaveAuditLog.model.js";
import LeavePolicy from "../LeaveModels/LeavePolicy.model.js";
import LeavePolicyRule from "../LeaveModels/LeavePolicyRule.model.js";
import JobPosting from "../RecruitmentModels/JobPosting.model.js";
import HiringStage from "../RecruitmentModels/HiringStage.model.js";
import ApplicationStageLog from "../RecruitmentModels/ApplicationStageLog.model.js";
import Application from "../RecruitmentModels/Application.model.js";
import Candidate from "../RecruitmentModels/Candidate.model.js";
import Offer from "../RecruitmentModels/Offer.model.js";
import Interview from "../RecruitmentModels/Interview.model.js";
import Referral from "../RecruitmentModels/Referral.model.js";
import JobRequisition from "../RecruitmentModels/JobRequisition.model.js";
import InterviewAuditLog from "../RecruitmentModels/InterviewAuditLog.model.js";
import Employee from "../EmployeeModels/Employee.model.js";
import Organization from "../Organizations/Organization.model.js";
import OrganizationProfile from "../Organizations/OraganizationProfile.model.js";
import OrganizationLegal from "../Organizations/OrganizationLegal.model.js";

User.hasMany(Organization, {
  foreignKey: "ownerId",
  as: "ownedOrganizations",
});

Organization.belongsTo(User, {
  foreignKey: "ownerId",
  as: "owner",
});

Organization.hasOne(OrganizationProfile, {
  foreignKey: "organizationId",
  as: "profile",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

OrganizationProfile.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Organization.hasOne(OrganizationLegal, {
  foreignKey: "organizationId",
  as: "legal",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

OrganizationLegal.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Organization.hasMany(User, { foreignKey: "tenantId", as: "users" });
User.belongsTo(Organization, { foreignKey: "tenantId", as: "organization" });

Organization.hasMany(UserIP, { foreignKey: "tenantId", as: "userIps" });
UserIP.belongsTo(Organization, { foreignKey: "tenantId", as: "organization" });

Organization.hasMany(Account, { foreignKey: "tenantId", as: "accounts" });
Account.belongsTo(Organization, { foreignKey: "tenantId", as: "organization" });

Organization.hasMany(Expenses, { foreignKey: "tenantId", as: "expenses" });
Expenses.belongsTo(Organization, { foreignKey: "tenantId", as: "organization" });

Organization.hasMany(Asset, { foreignKey: "tenantId", as: "assets" });
Asset.belongsTo(Organization, { foreignKey: "tenantId", as: "organization" });

Organization.hasMany(AssetRequest, {
  foreignKey: "tenantId",
  as: "assetRequests",
});
AssetRequest.belongsTo(Organization, {
  foreignKey: "tenantId",
  as: "organization",
});

Organization.hasMany(UserAsset, { foreignKey: "tenantId", as: "userAssets" });
UserAsset.belongsTo(Organization, { foreignKey: "tenantId", as: "organization" });

Organization.hasMany(Attendance, { foreignKey: "tenantId", as: "attendances" });
Attendance.belongsTo(Organization, { foreignKey: "tenantId", as: "organization" });

Organization.hasMany(AttendancePolicy, {
  foreignKey: "tenantId",
  as: "attendancePolicies",
});
AttendancePolicy.belongsTo(Organization, {
  foreignKey: "tenantId",
  as: "organization",
});

Organization.hasMany(AttendanceRequest, {
  foreignKey: "tenantId",
  as: "attendanceRequests",
});
AttendanceRequest.belongsTo(Organization, {
  foreignKey: "tenantId",
  as: "organization",
});

Organization.hasMany(AttendanceLog, {
  foreignKey: "tenantId",
  as: "attendanceLogs",
});
AttendanceLog.belongsTo(Organization, {
  foreignKey: "tenantId",
  as: "organization",
});

Organization.hasMany(Holiday, { foreignKey: "tenantId", as: "holidays" });
Holiday.belongsTo(Organization, { foreignKey: "tenantId", as: "organization" });

Organization.hasMany(LeaveRequest, { foreignKey: "tenantId", as: "leaveRequests" });
LeaveRequest.belongsTo(Organization, {
  foreignKey: "tenantId",
  as: "organization",
});

Organization.hasMany(LeaveBalance, { foreignKey: "tenantId", as: "leaveBalances" });
LeaveBalance.belongsTo(Organization, {
  foreignKey: "tenantId",
  as: "organization",
});

Organization.hasMany(LeaveType, { foreignKey: "tenantId", as: "leaveTypes" });
LeaveType.belongsTo(Organization, { foreignKey: "tenantId", as: "organization" });

Organization.hasMany(LeaveAuditLog, {
  foreignKey: "tenantId",
  as: "leaveAuditLogs",
});
LeaveAuditLog.belongsTo(Organization, {
  foreignKey: "tenantId",
  as: "organization",
});

Organization.hasMany(LeavePolicy, { foreignKey: "tenantId", as: "leavePolicies" });
LeavePolicy.belongsTo(Organization, {
  foreignKey: "tenantId",
  as: "organization",
});

Organization.hasMany(LeavePolicyRule, {
  foreignKey: "tenantId",
  as: "leavePolicyRules",
});
LeavePolicyRule.belongsTo(Organization, {
  foreignKey: "tenantId",
  as: "organization",
});

Organization.hasMany(Candidate, { foreignKey: "tenantId", as: "candidates" });
Candidate.belongsTo(Organization, { foreignKey: "tenantId", as: "organization" });

Organization.hasMany(Application, { foreignKey: "tenantId", as: "applications" });
Application.belongsTo(Organization, {
  foreignKey: "tenantId",
  as: "organization",
});

Organization.hasMany(ApplicationStageLog, {
  foreignKey: "tenantId",
  as: "applicationStageLogs",
});
ApplicationStageLog.belongsTo(Organization, {
  foreignKey: "tenantId",
  as: "organization",
});

Organization.hasMany(HiringStage, { foreignKey: "tenantId", as: "hiringStages" });
HiringStage.belongsTo(Organization, {
  foreignKey: "tenantId",
  as: "organization",
});

Organization.hasMany(JobPosting, { foreignKey: "tenantId", as: "jobPostings" });
JobPosting.belongsTo(Organization, { foreignKey: "tenantId", as: "organization" });

Organization.hasMany(JobRequisition, {
  foreignKey: "tenantId",
  as: "jobRequisitions",
});
JobRequisition.belongsTo(Organization, {
  foreignKey: "tenantId",
  as: "organization",
});

Organization.hasMany(Interview, { foreignKey: "tenantId", as: "interviews" });
Interview.belongsTo(Organization, { foreignKey: "tenantId", as: "organization" });

Organization.hasMany(InterviewAuditLog, {
  foreignKey: "tenantId",
  as: "interviewAuditLogs",
});
InterviewAuditLog.belongsTo(Organization, {
  foreignKey: "tenantId",
  as: "organization",
});

Organization.hasMany(Offer, { foreignKey: "tenantId", as: "offers" });
Offer.belongsTo(Organization, { foreignKey: "tenantId", as: "organization" });

Organization.hasMany(Referral, { foreignKey: "tenantId", as: "referrals" });
Referral.belongsTo(Organization, { foreignKey: "tenantId", as: "organization" });

Organization.hasMany(Employee, { foreignKey: "tenantId", as: "employees" });
Employee.belongsTo(Organization, { foreignKey: "tenantId", as: "organization" });
