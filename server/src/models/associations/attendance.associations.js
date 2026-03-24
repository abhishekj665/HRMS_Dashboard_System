import User from "../UserModels/user.model.js";
import Attendance from "../AttendanceModels/Attendance.model.js";
import AttendancePolicy from "../AttendanceModels/AttendancePolicy.model.js";
import OvertimePolicy from "../AttendanceModels/OvertimePolicy.js";
import AttendanceRequest from "../AttendanceModels/AttendanceRequest.model.js";
import AttendanceLog from "../AttendanceModels/AttendanceLog.model.js";

User.hasMany(Attendance, {
  as: "employee",
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Attendance.belongsTo(User, {
  foreignKey: "userId",
});

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

AttendancePolicy.hasOne(OvertimePolicy, {
  foreignKey: "attendancePolicyId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

OvertimePolicy.belongsTo(AttendancePolicy, {
  foreignKey: "attendancePolicyId",
});
