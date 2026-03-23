import { env } from "../config/env.js";
import { User } from "../models/Associations.model.js";

export const attendanceMailTemplate = (data) => {
  const {
    receiverName,
    userName,
    userRole,
    userEmail,
    punchInTime,
    date,
    ipAddress,
    location,
    dashboardUrl = env.client_url,
  } = data;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Punch In Notification</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f6f8">
    <tr>
      <td align="center" style="padding: 30px 10px;">
        
        
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius:8px; overflow:hidden;">
          
          
          <tr>
            <td bgcolor="#1976d2" style="padding:20px; color:#ffffff; text-align:center;">
              <h2 style="margin:0;">Attendance Punch-In Alert</h2>
            </td>
          </tr>

          
          <tr>
            <td style="padding:25px; color:#333333;">
              <p style="font-size:16px; margin:0 0 15px 0;">
                Hello <strong>${receiverName}</strong>,
              </p>

              <p style="font-size:14px; line-height:1.6; margin:0 0 20px 0;">
                A punch-in event has been recorded in the system. Details are below:
              </p>

              
              <table width="100%" cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse;">
                <tr>
                  <td width="40%" bgcolor="#f0f2f5"><strong>User Name</strong></td>
                  <td>${userName}</td>
                </tr>
                <tr>
                  <td bgcolor="#f0f2f5"><strong>User Role</strong></td>
                  <td>${userRole}</td>
                </tr>
                <tr>
                  <td bgcolor="#f0f2f5"><strong>Email</strong></td>
                  <td>${userEmail}</td>
                </tr>
                <tr>
                  <td bgcolor="#f0f2f5"><strong>Punch In Time</strong></td>
                  <td>${punchInTime}</td>
                </tr>
                <tr>
                  <td bgcolor="#f0f2f5"><strong>Date</strong></td>
                  <td>${date}</td>
                </tr>
                <tr>
                  <td bgcolor="#f0f2f5"><strong>IP Address</strong></td>
                  <td>${ipAddress}</td>
                </tr>
                <tr>
                  <td bgcolor="#f0f2f5"><strong>Location</strong></td>
                  <td>${location}</td>
                </tr>
              </table>

              <p style="font-size:14px; line-height:1.6; margin:20px 0;">
                Please review this entry in the attendance system if verification or approval is required.
              </p>

             
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td bgcolor="#1976d2" style="border-radius:4px;">
                    <a href="${dashboardUrl}" target="_blank"
                       style="display:inline-block; padding:12px 20px; font-size:14px; color:#ffffff; text-decoration:none;">
                      Open Dashboard
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          
          <tr>
            <td bgcolor="#f9fafb" style="padding:15px; text-align:center; font-size:12px; color:#777;">
              This is an automated message from the Attendance System.<br/>
              Do not reply to this email.
            </td>
          </tr>

        </table>
        

      </td>
    </tr>
  </table>
</body>
</html>
`;

  return html;
};

export const attendanceApprovedMailTemplate = (data) => {
  const { userName, managerName, date, punchInTime, remark, dashboardUrl = env.client_url } =
    data;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Attendance Approved</title>
</head>

<body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f6f8">
<tr>
<td align="center" style="padding:24px;">

<table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="border-radius:6px;">

<tr>
<td style="background:#2e7d32; color:#ffffff; padding:18px; text-align:center;">
<h2 style="margin:0;">Attendance Request Approved</h2>
</td>
</tr>

<tr>
<td style="padding:24px; color:#333; font-size:14px; line-height:1.6;">

<p>Hello <strong>${userName}</strong>,</p>

<p>Your attendance request has been approved by <strong>${managerName}</strong>.</p>

<table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
<tr>
<td width="45%" bgcolor="#f0f2f5"><strong>Date</strong></td>
<td>${date}</td>
</tr>
<tr>
<td bgcolor="#f0f2f5"><strong>Punch In Time</strong></td>
<td>${punchInTime || "-"}</td>
</tr>
<tr>
<td bgcolor="#f0f2f5"><strong>Manager Remark</strong></td>
<td>${remark || "-"}</td>
</tr>
</table>

<table cellpadding="0" cellspacing="0" align="center" style="margin-top:22px;">
<tr>
<td bgcolor="#2e7d32" style="border-radius:4px;">
<a href="${dashboardUrl}"
style="display:inline-block; padding:12px 20px; color:#ffffff; text-decoration:none;">
View Attendance
</a>
</td>
</tr>
</table>

</td>
</tr>

<tr>
<td style="padding:14px; text-align:center; font-size:12px; color:#777;">
Automated attendance notification. Do not reply.
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>`;
};

export const attendanceRejectedMailTemplate = (data) => {
  const { userName, managerName, date, punchInTime, remark, dashboardUrl = env.client_url } =
    data;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Attendance Rejected</title>
</head>

<body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f6f8">
<tr>
<td align="center" style="padding:24px;">

<table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="border-radius:6px;">

<tr>
<td style="background:#c62828; color:#ffffff; padding:18px; text-align:center;">
<h2 style="margin:0;">Attendance Request Rejected</h2>
</td>
</tr>

<tr>
<td style="padding:24px; color:#333; font-size:14px; line-height:1.6;">

<p>Hello <strong>${userName}</strong>,</p>

<p>Your attendance request has been rejected by <strong>${managerName}</strong>.</p>

<table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
<tr>
<td width="45%" bgcolor="#f0f2f5"><strong>Date</strong></td>
<td>${date}</td>
</tr>
<tr>
<td bgcolor="#f0f2f5"><strong>Punch In Time</strong></td>
<td>${punchInTime || "-"}</td>
</tr>
<tr>
<td bgcolor="#f0f2f5"><strong>Rejection Reason</strong></td>
<td>${remark || "-"}</td>
</tr>
</table>

<table cellpadding="0" cellspacing="0" align="center" style="margin-top:22px;">
<tr>
<td bgcolor="#c62828" style="border-radius:4px;">
<a href="${dashboardUrl}"
style="display:inline-block; padding:12px 20px; color:#ffffff; text-decoration:none;">
View Details
</a>
</td>
</tr>
</table>

</td>
</tr>

<tr>
<td style="padding:14px; text-align:center; font-size:12px; color:#777;">
Automated attendance notification. Do not reply.
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>`;
};

export const getAttendanceReceiver = async (user, transaction) => {
  if (user.role === "employee") return user.managerId;

  if (user.role === "manager") {
    const admin = await User.findOne({
      where: { role: "admin" },
      attributes: ["id"],
      order: [["id", "ASC"]],
      transaction,
    });
    return admin?.id;
  }

  return null;
};

export const buildPunchInMailData = (user, now, ipAddress, lat, lng) => ({
  receiverName: user.first_name || user.email.split("@")[0],
  userName: user.first_name || user.email.split("@")[0],
  userRole: user.role,
  userEmail: user.email,
  punchInTime: now,
  date: now.toISOString(),
  ipAddress,
  location: `${lat}, ${lng}`,
});
