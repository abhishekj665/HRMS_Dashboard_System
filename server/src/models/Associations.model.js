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
import Employee from "./EmployeeModels/Employee.model.js";
import Holiday from "./AttendanceModels/Holiday.model.js";
import Organization from "./Organizations/Organization.model.js";
import OrganizationProfile from "./Organizations/OraganizationProfile.model.js";
import OrganizationLegal from "./Organizations/OrganizationLegal.model.js";

import "./associations/organization.associations.js";
import "./associations/user.associations.js";
import "./associations/attendance.associations.js";
import "./associations/leave.associations.js";
import "./associations/recruitment.associations.js";

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
  InterviewAuditLog,
  Employee,
  Holiday,
  Organization,
  OrganizationProfile,
  OrganizationLegal,
};
