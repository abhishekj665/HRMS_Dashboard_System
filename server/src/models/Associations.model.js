import User from "./user.model.js";
import OTP from "./Otp.models.js";
import UserIP from "./UserIP.model.js";
import AssetRequest from "./AssestRequest.model.js";
import Asset from "./Asset.model.js";
import UserAsset from "./UserAsset.model.js";
import Expenses from "./Expenses.model.js";
import Account from "./Account.model.js";
import Attendance from "./Attendance.model.js";
import AttendancePolicy from "./AttendancePolicy.model.js";
import OvertimePolicy from "./OvertimePolicy.js";
import AttendanceRequest from "./AttendanceRequest.model.js";
import AttendanceLog from "./AttendanceLog.model.js";
import LeaveRequest from "./LeaveRequest.model.js";
import LeaveBalance from "./LeaveBalance.model.js";
import LeaveType from "./LeaveType.model.js";
import LeaveAuditLog from "./LeaveAuditLog.model.js";
import LeavePolicy from "./LeavePolicy.model.js";
import LeavePolicyRule from "./LeavePolicyRule.model.js";

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
};
