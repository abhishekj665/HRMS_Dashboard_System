import { AttendanceLog, AttendanceRequest } from "../models/Associations.model.js";

export async function calculateWorkedSecondsFromLogs(
  userId,
  attendanceId,
  transaction,
) {
  const logs = await AttendanceLog.findAll({
    where: { userId, attendanceId, isValid: true },
    order: [["punchTime", "ASC"]],
    transaction,
    lock: transaction ? transaction.LOCK.UPDATE : undefined,
  });

  let totalMs = 0;
  let lastIn = null;

  for (const log of logs) {
    if (log.punchType === "IN") {
      lastIn = log.punchTime;
    } else if (log.punchType === "OUT" && lastIn) {
      totalMs += new Date(log.punchTime) - new Date(lastIn);
      lastIn = null;
    }
  }

  return Math.floor(totalMs / 1000);
}
