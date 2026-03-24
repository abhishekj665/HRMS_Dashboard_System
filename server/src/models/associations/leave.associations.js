import User from "../UserModels/user.model.js";
import LeaveRequest from "../LeaveModels/LeaveRequest.model.js";
import LeaveBalance from "../LeaveModels/LeaveBalance.model.js";
import LeaveType from "../LeaveModels/LeaveType.model.js";
import LeaveAuditLog from "../LeaveModels/LeaveAuditLog.model.js";
import LeavePolicy from "../LeaveModels/LeavePolicy.model.js";
import LeavePolicyRule from "../LeaveModels/LeavePolicyRule.model.js";

User.hasMany(LeaveRequest, {
  foreignKey: "userId",
  as: "leaveRequests",
  onDelete: "CASCADE",
});

LeaveRequest.belongsTo(User, {
  foreignKey: "userId",
  as: "employee",
});

User.hasMany(LeaveRequest, {
  foreignKey: "reviewedBy",
  as: "reviewer",
});

LeaveRequest.belongsTo(User, {
  foreignKey: "reviewedBy",
  as: "reviewer",
});

User.hasMany(LeaveBalance, {
  foreignKey: "userId",
  as: "leaveBalances",
});

LeaveBalance.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

LeaveType.hasMany(LeaveBalance, {
  foreignKey: "leaveTypeId",
  onDelete: "CASCADE",
});

LeaveBalance.belongsTo(LeaveType, {
  foreignKey: "leaveTypeId",
});

LeaveType.hasMany(LeaveRequest, {
  foreignKey: "leaveTypeId",
});

LeaveRequest.belongsTo(LeaveType, {
  foreignKey: "leaveTypeId",
});

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

LeavePolicy.hasMany(LeavePolicyRule, {
  foreignKey: "policyId",
  as: "rules",
  onDelete: "CASCADE",
});

LeavePolicyRule.belongsTo(LeavePolicy, {
  foreignKey: "policyId",
  as: "policy",
});

LeaveType.hasMany(LeavePolicyRule, {
  foreignKey: "leaveTypeId",
  as: "policyRules",
});

LeavePolicyRule.belongsTo(LeaveType, {
  foreignKey: "leaveTypeId",
  as: "leaveType",
});

LeavePolicy.hasMany(User, {
  foreignKey: "leavePolicyId",
  as: "users",
});

User.belongsTo(LeavePolicy, {
  foreignKey: "leavePolicyId",
  as: "leavePolicy",
});

LeavePolicy.hasMany(LeaveBalance, {
  foreignKey: "policyId",
  as: "balances",
});

LeaveBalance.belongsTo(LeavePolicy, {
  foreignKey: "policyId",
  as: "policy",
});
