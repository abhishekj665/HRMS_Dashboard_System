import { env } from "../config/env.js";

export const expenseMailToManagerTemplate = (data) => {
  const {
    managerName,
    userName,
    userEmail,
    amount,
    date,
    time,
    category,
    billUrl,
    dashboardUrl = env.client_url,
  } = data;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>New Expense Request</title>
</head>

<body style="margin:0; padding:0; background:#f5f6f8; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f5f6f8">
    <tr>
      <td align="center" style="padding: 24px;">

        <table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="border-radius:6px;">
          
          <!-- Header -->
          <tr>
            <td style="background:#2e7d32; color:#ffffff; padding:18px; text-align:center;">
              <h2 style="margin:0;">New Expense Request Submitted</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px; color:#333;">
              
              <p style="font-size:15px;">
                Hello <strong>${managerName}</strong>,
              </p>

              <p style="font-size:14px; line-height:1.6;">
                A new expense request has been created and requires your review.
              </p>

             
         <!-- Details Table -->
<table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse; font-size:14px;">
  <tr>
    <td width="40%" bgcolor="#f0f2f5"><strong>User Name</strong></td>
    <td>${userName}</td>
  </tr>
  <tr>
    <td bgcolor="#f0f2f5"><strong>User Email</strong></td>
    <td>${userEmail}</td>
  </tr>
  <tr>
    <td bgcolor="#f0f2f5"><strong>Expense Amount</strong></td>
    <td>₹ ${amount}</td>
  </tr>
  <tr>
    <td bgcolor="#f0f2f5"><strong>Date</strong></td>
    <td>${date}</td>
  </tr>
  <tr>
    <td bgcolor="#f0f2f5"><strong>Time</strong></td>
    <td>${time}</td>
  </tr>
  <tr>
    <td bgcolor="#f0f2f5"><strong>Category</strong></td>
    <td>${category}</td>
  </tr>
</table>

${
  billUrl
    ? `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
  <tr>
    <td>
      <p style="font-size:14px; font-weight:bold; margin-bottom:8px;">
        Bill Preview
      </p>
      <img src="${billUrl}"
           alt="Expense Bill"
           style="max-width:100%; border:1px solid #ddd; border-radius:6px;" />
    </td>
  </tr>
</table>
`
    : ""
}

<!-- Buttons -->
<table cellpadding="0" cellspacing="0" align="center" style="margin-top:22px;">
  <tr>
    <td style="padding:6px;">
      <a href="${dashboardUrl}"
         style="display:inline-block; padding:12px 20px; background:#2e7d32; color:#ffffff; text-decoration:none; font-size:14px; border-radius:4px;">
         Review Request
      </a>
    </td>

    ${
      billUrl
        ? `<td style="padding:6px;">
            <a href="${billUrl}"
               style="display:inline-block; padding:12px 20px; background:#1565c0; color:#ffffff; text-decoration:none; font-size:14px; border-radius:4px;">
               View Bill
            </a>
           </td>`
        : ""
    }
  </tr>
</table>


            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:14px; text-align:center; font-size:12px; color:#777;">
              Automated message from Expense System. Please do not reply.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return html;
};

export const expenseApprovedMailTemplate = (data) => {
  const {
    userName,
    amountRequested,
    amountApproved,
    managerName,
    remark,
    date,
    dashboardUrl = env.client_url,
  } = data;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Expense Approved</title>
</head>

<body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f6f8">
<tr>
<td align="center" style="padding:24px;">

<table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="border-radius:6px;">

<tr>
<td style="background:#2e7d32; color:#ffffff; padding:18px; text-align:center;">
<h2 style="margin:0;">Expense Request Approved</h2>
</td>
</tr>

<tr>
<td style="padding:24px; color:#333; font-size:14px; line-height:1.6;">

<p>Hello <strong>${userName}</strong>,</p>

<p>Your expense request has been approved by <strong>${managerName}</strong>.</p>

<table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
<tr>
<td width="45%" bgcolor="#f0f2f5"><strong>Requested Amount</strong></td>
<td>₹ ${amountRequested}</td>
</tr>
<tr>
<td bgcolor="#f0f2f5"><strong>Approved Amount</strong></td>
<td>₹ ${amountApproved}</td>
</tr>
<tr>
<td bgcolor="#f0f2f5"><strong>Decision Date</strong></td>
<td>${date}</td>
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
View Expense
</a>
</td>
</tr>
</table>

</td>
</tr>

<tr>
<td style="padding:14px; text-align:center; font-size:12px; color:#777;">
This is an automated message. Do not reply.
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>`;
};

export const expenseRejectedMailTemplate = (data) => {
  const {
    userName,
    amountRequested,
    managerName,
    remark,
    date,
    dashboardUrl = env.client_url,
  } = data;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Expense Rejected</title>
</head>

<body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f6f8">
<tr>
<td align="center" style="padding:24px;">

<table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="border-radius:6px;">

<tr>
<td style="background:#c62828; color:#ffffff; padding:18px; text-align:center;">
<h2 style="margin:0;">Expense Request Rejected</h2>
</td>
</tr>

<tr>
<td style="padding:24px; color:#333; font-size:14px; line-height:1.6;">

<p>Hello <strong>${userName}</strong>,</p>

<p>Your expense request has been rejected by <strong>${managerName}</strong>.</p>

<table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
<tr>
<td width="45%" bgcolor="#f0f2f5"><strong>Requested Amount</strong></td>
<td>₹ ${amountRequested}</td>
</tr>
<tr>
<td bgcolor="#f0f2f5"><strong>Decision Date</strong></td>
<td>${date}</td>
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
This is an automated message. Do not reply.
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>`;
};

export const assetRequestMailTemplate = (data) => {
  const {
    managerName,
    userName,
    userEmail,
    assetName,
    assetType,
    requestDate,
    reason,
    dashboardUrl = env.client_url,
  } = data;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>New Asset Request</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial;">
<table width="100%" bgcolor="#f4f6f8" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:24px;">

<table width="600" bgcolor="#ffffff" cellpadding="0" cellspacing="0" style="border-radius:6px;">

<tr>
<td style="background:#1565c0;color:#fff;padding:18px;text-align:center;">
<h2 style="margin:0;">New Asset Request</h2>
</td>
</tr>

<tr>
<td style="padding:24px;font-size:14px;color:#333;line-height:1.6;">

<p>Hello <strong>${managerName}</strong>,</p>

<p>A new asset request has been submitted.</p>

<table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
<tr><td bgcolor="#f0f2f5"><strong>User</strong></td><td>${userName}</td></tr>
<tr><td bgcolor="#f0f2f5"><strong>Email</strong></td><td>${userEmail}</td></tr>
<tr><td bgcolor="#f0f2f5"><strong>Asset</strong></td><td>${assetName}</td></tr>
<tr><td bgcolor="#f0f2f5"><strong>Type</strong></td><td>${assetType}</td></tr>
<tr><td bgcolor="#f0f2f5"><strong>Date</strong></td><td>${requestDate}</td></tr>
<tr><td bgcolor="#f0f2f5"><strong>Reason</strong></td><td>${reason || "-"}</td></tr>
</table>

<table align="center" style="margin-top:22px;">
<tr>
<td bgcolor="#1565c0" style="border-radius:4px;">
<a href="${dashboardUrl}" style="color:#fff;text-decoration:none;padding:12px 20px;display:inline-block;">
Review Request
</a>
</td>
</tr>
</table>

</td>
</tr>

<tr>
<td style="text-align:center;font-size:12px;color:#777;padding:14px;">
Automated message. Do not reply.
</td>
</tr>

</table>
</td></tr></table>
</body>
</html>`;
};

export const assetApprovedMailTemplate = (data) => {
  const {
    userName,
    userEmail,
    assetName,
    quantity,
    assetType,
    requestDate,
    remark,
    managerName,
    dashboardUrl = env.client_url,
  } = data;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Asset Request Approved</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" bgcolor="#f4f6f8" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:24px;">

<table width="600" bgcolor="#ffffff" cellpadding="0" cellspacing="0" style="border-radius:6px;">

<!-- Header -->
<tr>
<td style="background:#2e7d32;color:#ffffff;padding:18px;text-align:center;">
<h2 style="margin:0;">Asset Request Approved</h2>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:24px;font-size:14px;color:#333;line-height:1.6;">

<p>Hello <strong>${userName}</strong>,</p>

<p>Your asset request has been approved by <strong>${managerName}</strong>.</p>

<table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:14px;">

<tr>
<td width="45%" bgcolor="#f0f2f5"><strong>User Name</strong></td>
<td>${userName}</td>
</tr>

<tr>
<td bgcolor="#f0f2f5"><strong>User Email</strong></td>
<td>${userEmail}</td>
</tr>

<tr>
<td bgcolor="#f0f2f5"><strong>Asset Name</strong></td>
<td>${assetName}</td>
</tr>

<tr>
<td bgcolor="#f0f2f5"><strong>Quantity Approved</strong></td>
<td>${quantity}</td>
</tr>

<tr>
<td bgcolor="#f0f2f5"><strong>Category</strong></td>
<td>${assetType}</td>
</tr>

<tr>
<td bgcolor="#f0f2f5"><strong>Requested On</strong></td>
<td>${requestDate}</td>
</tr>

<tr>
<td bgcolor="#f0f2f5"><strong>Manager Remark</strong></td>
<td>${remark || "-"}</td>
</tr>

</table>

<!-- Button -->
<table align="center" style="margin-top:22px;">
<tr>
<td bgcolor="#2e7d32" style="border-radius:4px;">
<a href="${dashboardUrl}"
style="display:inline-block;padding:12px 20px;color:#ffffff;text-decoration:none;font-size:14px;">
View Asset Request
</a>
</td>
</tr>
</table>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:14px;text-align:center;font-size:12px;color:#777;">
Automated message from Asset System. Please do not reply.
</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>`;
};

export const assetRejectedMailTemplate = (data) => {
  const {
    userName,
    userEmail,
    assetName,
    quantity,
    assetType,
    requestDate,
    reason,
    managerName,
    dashboardUrl = env.client_url,
  } = data;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Asset Request Rejected</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" bgcolor="#f4f6f8" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:24px;">

<table width="600" bgcolor="#ffffff" cellpadding="0" cellspacing="0" style="border-radius:6px;">

<!-- Header -->
<tr>
<td style="background:#c62828;color:#ffffff;padding:18px;text-align:center;">
<h2 style="margin:0;">Asset Request Rejected</h2>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:24px;font-size:14px;color:#333;line-height:1.6;">

<p>Hello <strong>${userName}</strong>,</p>

<p>Your asset request has been rejected by <strong>${managerName}</strong>.</p>

<table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:14px;">

<tr>
<td width="45%" bgcolor="#f0f2f5"><strong>User Name</strong></td>
<td>${userName}</td>
</tr>

<tr>
<td bgcolor="#f0f2f5"><strong>User Email</strong></td>
<td>${userEmail}</td>
</tr>

<tr>
<td bgcolor="#f0f2f5"><strong>Asset Name</strong></td>
<td>${assetName}</td>
</tr>

<tr>
<td bgcolor="#f0f2f5"><strong>Quantity</strong></td>
<td>${quantity}</td>
</tr>

<tr>
<td bgcolor="#f0f2f5"><strong>Category</strong></td>
<td>${assetType}</td>
</tr>

<tr>
<td bgcolor="#f0f2f5"><strong>Requested On</strong></td>
<td>${requestDate}</td>
</tr>

<tr>
<td bgcolor="#f0f2f5"><strong>Rejection Reason</strong></td>
<td>${reason || "-"}</td>
</tr>

</table>

<!-- Button -->
<table align="center" style="margin-top:22px;">
<tr>
<td bgcolor="#c62828" style="border-radius:4px;">
<a href="${dashboardUrl}"
style="display:inline-block;padding:12px 20px;color:#ffffff;text-decoration:none;font-size:14px;">
View Request
</a>
</td>
</tr>
</table>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:14px;text-align:center;font-size:12px;color:#777;">
Automated message from Asset System. Please do not reply.
</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>`;
};

export const getJobRequisitionEmailTemplate = (data) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Job Requisition Approval</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#1976d2; padding:20px; color:#ffffff; font-size:20px; font-weight:bold;">
              Job Requisition Approval Required
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333; font-size:14px; line-height:1.6;">

              <p>Hello Admin,</p>

              <p>A new job requisition has been submitted and requires your approval. Please review the details below:</p>

              <!-- Details Table -->
              <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse; margin-top:20px;">

                <tr>
                  <td style="background:#f2f2f2; font-weight:bold;">Requisition ID</td>
                  <td>${data.id}</td>
                </tr>

                <tr>
                  <td style="background:#f9f9f9; font-weight:bold;">Job Title</td>
                  <td>${data.title}</td>
                </tr>

                <tr>
                  <td style="background:#f2f2f2; font-weight:bold;">Employment Type</td>
                  <td>${data.employmentType}</td>
                </tr>

                <tr>
                  <td style="background:#f9f9f9; font-weight:bold;">Location</td>
                  <td>${data.location}</td>
                </tr>

                <tr>
                  <td style="background:#f2f2f2; font-weight:bold;">Experience</td>
                  <td>${data.experienceMin} - ${data.experienceMax} Years</td>
                </tr>

                <tr>
                  <td style="background:#f9f9f9; font-weight:bold;">Budget Range</td>
                  <td>₹${data.budgetMin} - ₹${data.budgetMax}</td>
                </tr>

                <tr>
                  <td style="background:#f2f2f2; font-weight:bold;">Head Count</td>
                  <td>${data.headCount}</td>
                </tr>

                <tr>
                  <td style="background:#f9f9f9; font-weight:bold;">Priority</td>
                  <td>${data.priority}</td>
                </tr>

                <tr>
                  <td style="background:#f2f2f2; font-weight:bold;">Status</td>
                  <td>${data.status}</td>
                </tr>

              </table>

              <!-- Description -->
              <div style="margin-top:25px;">
                <p style="font-weight:bold;">Job Description</p>
                <p style="background:#f9f9f9; padding:15px; border-radius:4px;">
                  ${data.jobDescription}
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center; margin-top:30px;">
                <a href="${env.client_url}/admin/job-requisitions/${data.id}"
                   style="background:#1976d2; color:#ffffff; text-decoration:none; padding:12px 25px; border-radius:4px; display:inline-block; font-weight:bold;">
                  Review & Approve
                </a>
              </div>

              <p style="margin-top:30px;">Regards,<br/>HR Management System</p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f2f2f2; padding:15px; text-align:center; font-size:12px; color:#777;">
              This is an automated notification. Please do not reply directly to this email.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};

export function escapeHtml(value) {
  const str = String(value ?? "");

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getLeaveRequestCreatedTemplate({
  managerName,
  employeeName,
  leaveType,
  startDate,
  endDate,
  daysRequested,
  reason,
  actionUrl = env.client_url,
}) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
      <tr>
        <td align="center">
          <table width="600" style="background:#ffffff;border-radius:8px;padding:30px;">
            
            <tr>
              <td style="font-size:20px;font-weight:bold;color:#1f2937;">
                New Leave Request Submitted
              </td>
            </tr>

            <tr><td height="20"></td></tr>

            <tr>
              <td style="font-size:14px;color:#4b5563;">
                Hello ${escapeHtml(managerName)},
              </td>
            </tr>

            <tr><td height="10"></td></tr>

            <tr>
              <td style="background:#f9fafb;padding:15px;border-radius:6px;">
                <p><strong>Employee:</strong> ${escapeHtml(employeeName)}</p>
                <p><strong>Leave Type:</strong> ${escapeHtml(leaveType)}</p>
                <p><strong>From:</strong> ${escapeHtml(startDate)}</p>
                <p><strong>To:</strong> ${escapeHtml(endDate)}</p>
                <p><strong>Total Days:</strong> ${escapeHtml(daysRequested)}</p>
                <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
              </td>
            </tr>

            <tr><td height="20"></td></tr>

            <tr>
              <td align="center">
                <a href="${escapeHtml(actionUrl)}"
                   style="background:#2563eb;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:4px;">
                   Review Request
                </a>
              </td>
            </tr>

            <tr><td height="30"></td></tr>

            <tr>
              <td style="font-size:12px;color:#9ca3af;">
                This is an automated message. Please do not reply.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

export function getLeaveApprovedTemplate({
  employeeName,
  leaveType,
  startDate,
  endDate,
  daysRequested,
}) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
      <tr>
        <td align="center">
          <table width="600" style="background:#ffffff;border-radius:8px;padding:30px;">

            <tr>
              <td style="font-size:20px;font-weight:bold;color:#16a34a;">
                Leave Request Approved
              </td>
            </tr>

            <tr><td height="20"></td></tr>

            <tr>
              <td style="font-size:14px;color:#4b5563;">
                Hello ${escapeHtml(employeeName)},
              </td>
            </tr>

            <tr><td height="10"></td></tr>

            <tr>
              <td style="background:#f0fdf4;padding:15px;border-radius:6px;">
                <p><strong>Leave Type:</strong> ${escapeHtml(leaveType)}</p>
                <p><strong>From:</strong> ${escapeHtml(startDate)}</p>
                <p><strong>To:</strong> ${escapeHtml(endDate)}</p>
                <p><strong>Total Days:</strong> ${escapeHtml(daysRequested)}</p>
              </td>
            </tr>

            <tr><td height="30"></td></tr>

            <tr>
              <td style="font-size:12px;color:#9ca3af;">
                Wishing you a pleasant time off.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

export function getLeaveRejectedTemplate({
  employeeName,
  leaveType,
  startDate,
  endDate,
  daysRequested,
  remark,
}) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
      <tr>
        <td align="center">
          <table width="600" style="background:#ffffff;border-radius:8px;padding:30px;">

            <tr>
              <td style="font-size:20px;font-weight:bold;color:#dc2626;">
                Leave Request Rejected
              </td>
            </tr>

            <tr><td height="20"></td></tr>

            <tr>
              <td style="font-size:14px;color:#4b5563;">
                Hello ${escapeHtml(employeeName)},
              </td>
            </tr>

            <tr><td height="10"></td></tr>

            <tr>
              <td style="background:#fef2f2;padding:15px;border-radius:6px;">
                <p><strong>Leave Type:</strong> ${escapeHtml(leaveType)}</p>
                <p><strong>From:</strong> ${escapeHtml(startDate)}</p>
                <p><strong>To:</strong> ${escapeHtml(endDate)}</p>
                <p><strong>Total Days:</strong> ${escapeHtml(daysRequested)}</p>
                <p><strong>Manager Remark:</strong> ${escapeHtml(remark)}</p>
              </td>
            </tr>

            <tr><td height="30"></td></tr>

            <tr>
              <td style="font-size:12px;color:#9ca3af;">
                Please contact your manager for clarification.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

const buildCommonRows = (data) => {
  return `
    ${row("Requisition ID", data.requisitionId)}
    ${row("Job Title", data.title)}
    ${row("Location", data.location)}
    ${row("Employment Type", data.employmentType)}
    ${row("Experience", `${data.experienceMin} - ${data.experienceMax} Years`)}
    ${row("Budget Range", `₹${data.budgetMin} - ₹${data.budgetMax}`)}
    ${row("Head Count", data.headCount)}
    ${row("Priority", data.priority)}
  `;
};

const row = (label, value) => `
  <tr>
    <td style="background:#f2f2f2; font-weight:bold;">${label}</td>
    <td>${value}</td>
  </tr>
`;

const footerSection = () => `
  <tr>
    <td style="background:#f2f2f2; padding:15px; text-align:center; font-size:12px; color:#777;">
      This is an automated notification. Please do not reply directly.
    </td>
  </tr>
`;

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const requisitionRequestApprovalEmailTemplate = (data) => {
  const {
    requisitionId,
    title,
    location,
    employmentType,
    experienceMin,
    experienceMax,
    budgetMin,
    budgetMax,
    headCount,
    priority,
    approvedAt,
  } = data;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Job Requisition Approved</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

            <tr>
              <td style="background:#2e7d32; padding:20px; color:#ffffff; font-size:20px; font-weight:bold;">
                Job Requisition Approved
              </td>
            </tr>

            <tr>
              <td style="padding:30px; color:#333333; font-size:14px; line-height:1.6;">
                <p>Hello,</p>
                <p>Your job requisition has been successfully approved.</p>

                <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse; margin-top:20px;">
                  ${buildCommonRows({
                    requisitionId,
                    title,
                    location,
                    employmentType,
                    experienceMin,
                    experienceMax,
                    budgetMin,
                    budgetMax,
                    headCount,
                    priority,
                  })}

                  <tr>
                    <td style="background:#f9f9f9; font-weight:bold;">Approved On</td>
                    <td>${formatDate(approvedAt)}</td>
                  </tr>
                </table>

                <div style="text-align:center; margin-top:30px;">
                  <a href="${env.client_url}" 
                     style="background:#2e7d32; color:#ffffff; text-decoration:none; padding:12px 25px; border-radius:4px; display:inline-block; font-weight:bold;">
                    View Job Posting
                  </a>
                </div>

                <p style="margin-top:30px;">
                  Regards,<br/>
                  HR Management System
                </p>
              </td>
            </tr>

            ${footerSection()}

          </table>

        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

export const requisitionRejectionEmailTemplate = (data) => {
  const {
    requisitionId,
    title,
    location,
    employmentType,
    experienceMin,
    experienceMax,
    budgetMin,
    budgetMax,
    headCount,
    priority,
    remark,
    loginUrl,
  } = data;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Job Requisition Rejected</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

            <tr>
              <td style="background:#c62828; padding:20px; color:#ffffff; font-size:20px; font-weight:bold;">
                Job Requisition Rejected
              </td>
            </tr>

            <tr>
              <td style="padding:30px; color:#333333; font-size:14px; line-height:1.6;">
                <p>Hello,</p>
                <p>Your job requisition was reviewed and has been rejected.</p>

                <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse; margin-top:20px;">
                  ${buildCommonRows({
                    requisitionId,
                    title,
                    location,
                    employmentType,
                    experienceMin,
                    experienceMax,
                    budgetMin,
                    budgetMax,
                    headCount,
                    priority,
                  })}
                </table>

                <div style="margin-top:25px;">
                  <p style="font-weight:bold;">Admin Remark</p>
                  <p style="background:#fdecea; padding:15px; border-radius:4px; border:1px solid #f5c6cb;">
                    ${remark || "No remark provided."}
                  </p>
                </div>

                <div style="text-align:center; margin-top:30px;">
                  <a href="${loginUrl}" 
                     style="background:#c62828; color:#ffffff; text-decoration:none; padding:12px 25px; border-radius:4px; display:inline-block; font-weight:bold;">
                    Review Requisition
                  </a>
                </div>

                <p style="margin-top:30px;">
                  Regards,<br/>
                  HR Management System
                </p>
              </td>
            </tr>

            ${footerSection()}

          </table>

        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

export const jobApplicationReceivedEmailTemplate = (data) => {
  const {
    firstName,
    companyName,
    jobTitle,
    careersUrl = env.client_url,
    year = new Date().getFullYear(),
  } = data;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Application Received</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
    <tr>
      <td align="center">

        <table width="650" cellpadding="0" cellspacing="0" 
               style="background-color:#ffffff; border-radius:8px; padding:40px;">

          <!-- Header -->
          <tr>
            <td style="font-size:22px; font-weight:600; color:#111827;">
              ${companyName}
            </td>
          </tr>

          <tr>
            <td style="padding-top:30px; font-size:20px; font-weight:600; color:#111827;">
              We've received your application
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding-top:20px; font-size:15px; line-height:1.7; color:#4b5563;">

              Hi ${firstName},<br><br>

              Thank you for applying for the <strong>${jobTitle}</strong> position at ${companyName}.
              We sincerely appreciate the time and effort you invested in submitting your application.

              <br><br>

              Our hiring team is currently reviewing applications to identify candidates whose experience and skills closely align with the role requirements. 
              Every application is evaluated carefully to ensure a fair and thorough selection process.

              <br><br>

              If your profile matches what we are looking for, our team will reach out to you regarding the next steps, which may include:

              <ul style="margin-top:10px; padding-left:20px; color:#4b5563;">
                <li>Initial screening discussion</li>
                <li>Technical or role-specific assessment</li>
                <li>Interaction with the hiring team</li>
              </ul>

              Please note that review timelines may vary depending on the number of applications received. 
              If shortlisted, you will be contacted directly by our recruitment team.

              <br><br>

              In the meantime, feel free to explore other opportunities with us.

              <br><br>

              We appreciate your interest in joining ${companyName} and wish you the very best.
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="left" style="padding-top:30px;">
              <a href="${careersUrl}"
                 style="background-color:#111827; color:#ffffff; padding:12px 28px; text-decoration:none; border-radius:6px; font-size:14px; font-weight:500; display:inline-block;">
                View More Opportunities
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-top:40px;">
              <hr style="border:none; border-top:1px solid #e5e7eb;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:20px; font-size:13px; color:#9ca3af; line-height:1.6;">
              This is an automated confirmation email. Please do not reply to this message.<br><br>
              © ${year} ${companyName}. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
};

export function generateShortlistedEmail({
  candidateName,
  jobTitle,
  companyName,
  interviewNextStep = "Interview Round",
  portalLink = env.client_url,
  supportEmail = "support@hrms.com",
  companyLogoUrl = "chrome://favicon2/?size=24&scaleFactor=1x&showFallbackMonogram=&pageUrl=http%3A%2F%2Flocalhost%3A5173%2Flogin",
  careersPageLink = env.client_url,
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Application Shortlisted</title>
</head>

<body style="margin:0; padding:0; background-color:#f2f4f7; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">

        <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background:#1a73e8; padding:30px;">
              <img src="${companyLogoUrl}" alt="${companyName}" width="140" style="display:block; margin-bottom:15px;" />
              <h1 style="color:#ffffff; margin:0; font-size:22px;">
                Application Shortlisted
              </h1>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px; color:#333333; font-size:15px; line-height:1.7;">

              <p style="margin-top:0;">
                Dear <strong>${candidateName}</strong>,
              </p>

              <p>
                We are pleased to inform you that your application for the position of 
                <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has successfully progressed to the next stage of our recruitment process.
              </p>

              <p>
                After a detailed review of your profile and qualifications, our hiring panel found your experience aligned with our current requirements. We would now like to move forward with the <strong>${interviewNextStep}</strong>.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="${portalLink}" 
                       style="background-color:#1a73e8; color:#ffffff; padding:14px 28px; 
                              text-decoration:none; border-radius:6px; display:inline-block; 
                              font-weight:bold;">
                      View Application Status
                    </a>
                  </td>
                </tr>
              </table>

              <p>
                Our team will contact you shortly with scheduling details and additional instructions. 
                Please ensure your contact information remains up to date.
              </p>

              <p>
                We appreciate the effort and time you invested in your application and look forward to continuing the conversation.
              </p>

              <p style="margin-top:30px;">
                Kind regards,<br>
                <strong>${companyName} Recruitment Team</strong>
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8f9fb; padding:30px; font-size:12px; color:#777777; text-align:center;">
              <p style="margin:0 0 10px 0;">
                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
              </p>

              <p style="margin:0 0 10px 0;">
                For assistance, contact 
                <a href="mailto:${supportEmail}" style="color:#1a73e8; text-decoration:none;">
                  ${supportEmail}
                </a>
              </p>

              <p style="margin:0;">
                Explore more opportunities at 
                <a href="${careersPageLink}" style="color:#1a73e8; text-decoration:none;">
                  Careers Page
                </a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

export function generateRejectedEmail({
  candidateName,
  jobTitle,
  companyName,
  supportEmail = "support@hrms.com",
  companyLogoUrl = "chrome://favicon2/?size=24&scaleFactor=1x&showFallbackMonogram=&pageUrl=http%3A%2F%2Flocalhost%3A5173%2Flogin",
  careersPageLink = env.client_url,
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Application Update</title>
</head>

<body style="margin:0; padding:0; background-color:#f2f4f7; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">

        <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background:#d93025; padding:30px;">
              <img src="${companyLogoUrl}" alt="${companyName}" width="140" style="display:block; margin-bottom:15px;" />
              <h1 style="color:#ffffff; margin:0; font-size:22px;">
                Application Update
              </h1>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px; color:#333333; font-size:15px; line-height:1.7;">

              <p style="margin-top:0;">
                Dear <strong>${candidateName}</strong>,
              </p>

              <p>
                Thank you for your interest in the <strong>${jobTitle}</strong> role at <strong>${companyName}</strong>.
              </p>

              <p>
                After careful evaluation of all applications received, we regret to inform you that we will not be progressing your application further at this stage.
              </p>

              <p>
                This decision was not easy due to the high quality of candidates we reviewed. While your experience is commendable, we have selected profiles that more closely match the specific needs of this position.
              </p>

              <p>
                We sincerely appreciate your effort and encourage you to apply for future opportunities that align with your expertise.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="${careersPageLink}" 
                       style="background-color:#d93025; color:#ffffff; padding:14px 28px; 
                              text-decoration:none; border-radius:6px; display:inline-block; 
                              font-weight:bold;">
                      View Open Positions
                    </a>
                  </td>
                </tr>
              </table>

              <p>
                We wish you continued success in your professional journey.
              </p>

              <p style="margin-top:30px;">
                Sincerely,<br>
                <strong>${companyName} Recruitment Team</strong>
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8f9fb; padding:30px; font-size:12px; color:#777777; text-align:center;">
              <p style="margin:0 0 10px 0;">
                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
              </p>

              <p style="margin:0;">
                For inquiries, contact 
                <a href="mailto:${supportEmail}" style="color:#d93025; text-decoration:none;">
                  ${supportEmail}
                </a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

export function generateInterviewScheduledEmail(data) {
  const {
    candidateName,
    jobTitle,
    companyName,
    interviewDate,
    interviewTime,
    interviewerName,
    mode,
    meetingLink,
    location,
    supportEmail = "support@hrms.com",
  } = data;

  const locationBlock =
    mode === "Online"
      ? `
        <tr>
          <td style="padding: 8px 0;">
            <strong>Meeting Link:</strong><br/>
            <a href="${meetingLink}" style="color:#2563eb; text-decoration:none;">
              ${meetingLink}
            </a>
          </td>
        </tr>
      `
      : `
        <tr>
          <td style="padding: 8px 0;">
            <strong>Location:</strong><br/>
            ${location}
          </td>
        </tr>
      `;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Interview Scheduled</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
      <tr>
        <td align="center">

          <!-- Main Container -->
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="background-color:#111827; padding:20px 30px; color:#ffffff;">
                <h2 style="margin:0;">${companyName}</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#374151; font-size:15px; line-height:1.6;">

                <p style="margin-top:0;">
                  Dear <strong>${candidateName}</strong>,
                </p>

                <p>
                  Thank you for your interest in the <strong>${jobTitle}</strong> position at ${companyName}. 
                  We are pleased to inform you that your profile has been shortlisted for the next stage of our selection process.
                </p>

                <p>
                  Your interview has been scheduled with the following details:
                </p>

                <!-- Interview Details Box -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:20px;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong>Date:</strong><br/>
                      ${interviewDate}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong>Time:</strong><br/>
                      ${interviewTime}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong>Mode:</strong><br/>
                      ${mode}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong>Interviewer:</strong><br/>
                      ${interviewerName}
                    </td>
                  </tr>

                  ${locationBlock}

                </table>

                <p style="margin-top:25px;">
                  Please ensure you are available at the scheduled time. If you foresee any challenges or need clarification, feel free to reach out to us.
                </p>

                <p>
                  We look forward to speaking with you and learning more about your experience.
                </p>

                <p style="margin-top:30px;">
                  Best regards,<br/>
                  <strong>Talent Acquisition Team</strong><br/>
                  ${companyName}<br/>
                  <a href="mailto:${supportEmail}" style="color:#2563eb; text-decoration:none;">
                    ${supportEmail}
                  </a>
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f3f4f6; padding:20px 30px; font-size:12px; color:#6b7280; text-align:center;">
                This is an automated message. Please do not reply directly to this email.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}

export function generateInterviewAssignmentEmail(data) {
  const {
    interviewerName,
    candidateName,
    jobTitle,
    companyName,
    interviewDate,
    interviewTime,
    duration,
    roundName,
    mode,
    meetingLink,
    location,
    acceptUrl,
    declineUrl,
    rescheduleUrl,
  } = data;

  const locationBlock =
    mode === "Online"
      ? `
        <tr>
          <td style="padding:8px 0;">
            <strong>Meeting Link:</strong><br/>
            <a href="${meetingLink}" style="color:#2563eb; text-decoration:none;">
              ${meetingLink}
            </a>
          </td>
        </tr>
      `
      : `
        <tr>
          <td style="padding:8px 0;">
            <strong>Location:</strong><br/>
            ${location}
          </td>
        </tr>
      `;

  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0; background:#f4f6f8;">
      <tr>
        <td align="center">

          <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="background:#111827; padding:20px 30px; color:#ffffff;">
                <h2 style="margin:0;">Interview Assignment</h2>
                <p style="margin:5px 0 0 0; font-size:13px;">
                  ${companyName}
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#374151; font-size:15px; line-height:1.6;">

                <p style="margin-top:0;">
                  Dear <strong>${interviewerName}</strong>,
                </p>

                <p>
                  You have been assigned to conduct a <strong>${roundName}</strong> interview 
                  for the position of <strong>${jobTitle}</strong>.
                </p>

                <p>
                  Please review the interview details below and confirm your availability.
                </p>

                <!-- Interview Details -->
                <table width="100%" cellpadding="0" cellspacing="0" 
                  style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:20px; margin-top:15px;">
                  
                  <tr>
                    <td style="padding:8px 0;">
                      <strong>Candidate:</strong><br/>
                      ${candidateName}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 0;">
                      <strong>Date:</strong><br/>
                      ${interviewDate}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 0;">
                      <strong>Time:</strong><br/>
                      ${interviewTime}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 0;">
                      <strong>Duration:</strong><br/>
                      ${duration} Minutes
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 0;">
                      <strong>Mode:</strong><br/>
                      ${mode}
                    </td>
                  </tr>

                  ${locationBlock}

                </table>

                <!-- Action Buttons -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:25px;">
                  <tr>
                    <td align="center">

                      <a href="${acceptUrl}" 
                        style="display:inline-block; padding:12px 20px; margin-right:10px; 
                               background:#16a34a; color:#ffffff; text-decoration:none; 
                               border-radius:6px; font-weight:bold;">
                        Accept
                      </a>

                      <a href="${declineUrl}" 
                        style="display:inline-block; padding:12px 20px; margin-right:10px; 
                               background:#dc2626; color:#ffffff; text-decoration:none; 
                               border-radius:6px; font-weight:bold;">
                        Decline
                      </a>

                      <a href="${rescheduleUrl}" 
                        style="display:inline-block; padding:12px 20px; 
                               background:#f59e0b; color:#ffffff; text-decoration:none; 
                               border-radius:6px; font-weight:bold;">
                        Request Reschedule
                      </a>

                    </td>
                  </tr>
                </table>

                <p style="margin-top:30px;">
                  If no action is taken, the interview will remain pending confirmation.
                </p>

                <p>
                  Thank you for your support in the hiring process.
                </p>

                <p style="margin-top:30px;">
                  Regards,<br/>
                  <strong>Talent Acquisition Team</strong><br/>
                  ${companyName}
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f3f4f6; padding:15px; text-align:center; font-size:12px; color:#6b7280;">
                This is an automated notification. Please do not reply directly to this email.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}

export function generateCandidateInterviewEmail(data) {
  const {
    candidateName,
    jobTitle,
    companyName,
    interviewDate,
    interviewTime,
    duration,
    roundName,
    mode,
    meetingLink,
    location,
    supportEmail = "support@hrms.com",
  } = data;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Interview Scheduled</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:30px 0;">
      <tr>
        <td align="center">
          
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background-color:#1f2937;padding:24px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:20px;">
                  ${companyName}
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px;">
                
                <h2 style="margin-top:0;color:#111827;">
                  Interview Scheduled 🎯
                </h2>

                <p style="color:#374151;font-size:14px;line-height:1.6;">
                  Dear ${candidateName},
                </p>

                <p style="color:#374151;font-size:14px;line-height:1.6;">
                  We are pleased to inform you that your interview for the position of 
                  <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been scheduled.
                </p>

                <!-- Interview Details Card -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border:1px solid #e5e7eb;border-radius:6px;">
                  <tr>
                    <td style="padding:16px;background:#f9fafb;">
                      
                      <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;color:#374151;">
                        <tr>
                          <td><strong>Interview Round:</strong></td>
                          <td>${roundName}</td>
                        </tr>
                        <tr>
                          <td><strong>Date:</strong></td>
                          <td>${interviewDate}</td>
                        </tr>
                        <tr>
                          <td><strong>Time:</strong></td>
                          <td>${interviewTime}</td>
                        </tr>
                        <tr>
                          <td><strong>Duration:</strong></td>
                          <td>${duration} minutes</td>
                        </tr>
                        <tr>
                          <td><strong>Mode:</strong></td>
                          <td>${mode === "ONLINE" ? "Online" : "Offline"}</td>
                        </tr>
                        ${
                          mode === "ONLINE"
                            ? `
                        <tr>
                          <td><strong>Meeting Link:</strong></td>
                          <td>
                            <a href="${meetingLink}" style="color:#2563eb;text-decoration:none;">
                              Join Interview
                            </a>
                          </td>
                        </tr>`
                            : `
                        <tr>
                          <td><strong>Location:</strong></td>
                          <td>${location}</td>
                        </tr>`
                        }
                      </table>

                    </td>
                  </tr>
                </table>

                <p style="margin-top:24px;color:#374151;font-size:14px;line-height:1.6;">
                  Please ensure that you are available at least 10 minutes prior to the scheduled time.
                  If this is an online interview, kindly verify your internet connection and device setup in advance.
                </p>

                <p style="color:#374151;font-size:14px;line-height:1.6;">
                  If you need to reschedule or have any questions, please reach out to us at 
                  <a href="mailto:${supportEmail}" style="color:#2563eb;text-decoration:none;">
                    ${supportEmail}
                  </a>.
                </p>

                <p style="margin-top:30px;color:#374151;font-size:14px;">
                  We look forward to speaking with you.
                </p>

                <p style="margin-top:16px;color:#374151;font-size:14px;">
                  Best regards,<br/>
                  <strong>${companyName} Talent Acquisition Team</strong>
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#6b7280;">
                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}

export function getAdminInterviewDeclinedTemplate({
  adminName,
  candidateName,
  jobTitle,
  interviewDate,
  interviewTime,
  interviewerName,
  reason,
  rescheduleLink,
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Interview Declined</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:30px;">
            
            <tr>
              <td>
                <h2 style="color:#d32f2f;margin-bottom:10px;">
                  Interview Declined
                </h2>
                <p style="color:#333;font-size:14px;">
                  Hello ${adminName},
                </p>
                <p style="color:#333;font-size:14px;">
                  The interview scheduled for <strong>${candidateName}</strong> 
                  (Position: ${jobTitle}) on 
                  <strong>${interviewDate}</strong> at 
                  <strong>${interviewTime}</strong> has been declined by 
                  <strong>${interviewerName}</strong>.
                </p>

                ${
                  reason
                    ? `<p style="color:#555;font-size:14px;">
                        <strong>Reason:</strong> ${reason}
                       </p>`
                    : ""
                }

                <p style="color:#333;font-size:14px;">
                  Please reschedule the interview at your earliest convenience.
                </p>

                <div style="margin:20px 0;text-align:center;">
                  <a href="${rescheduleLink}" 
                     style="background:#1976d2;color:#ffffff;
                     padding:12px 20px;text-decoration:none;
                     border-radius:4px;font-size:14px;">
                    Reschedule Interview
                  </a>
                </div>

                <p style="font-size:12px;color:#888;">
                  This is an automated notification. Please do not reply.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

export const nextRoundSelectedEmailTemplate = ({
  candidateName = "Candidate",
  jobTitle,
  companyName = "Orvane Digitals",
  nextStageName,
  supportEmail = "support@orvanve",
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Interview Update</title>
  </head>

  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:20px;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="background:#1976d2;padding:20px;text-align:center;color:#ffffff;">
                <h2 style="margin:0;">${companyName}</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;color:#333333;line-height:1.6;">

                <p style="margin-top:0;">Dear ${candidateName},</p>

                <p>
                  Thank you for taking the time to interview with us for the 
                  <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.
                </p>

                <p>
                  We are pleased to inform you that based on your recent interview performance,
                  you have successfully progressed to the <strong>${nextStageName}</strong> stage 
                  of our hiring process.
                </p>

                <p>
                  Our team was impressed with your skills, experience, and the insights you shared
                  during the interview. We believe your profile shows strong potential for the role,
                  and we are excited to continue the conversation.
                </p>

                <p>
                  Our recruitment team will reach out to you shortly with further details regarding 
                  the next round, including scheduling information and any preparation guidelines 
                  you may need.
                </p>

                <p>
                  In the meantime, if you have any questions or require assistance, please feel free 
                  to contact us at <a href="mailto:${supportEmail}" style="color:#1976d2;text-decoration:none;">
                  ${supportEmail}</a>.
                </p>

                <p>
                  We appreciate your interest in joining <strong>${companyName}</strong> and look 
                  forward to speaking with you again soon.
                </p>

                <p style="margin-bottom:0;">
                  Best regards,<br/>
                  <strong>${companyName} Recruitment Team</strong>
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f1f3f5;padding:20px;text-align:center;font-size:12px;color:#777;">
                <p style="margin:0;">
                  This is an automated message regarding your job application.
                </p>
                <p style="margin:5px 0 0 0;">
                  © ${new Date().getFullYear()} ${companyName}. All rights reserved.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};

export const interviewRejectionEmailTemplate = ({
  candidateName,
  jobTitle,
  companyName = "Our Company",
  stageName,
  supportEmail = "careers@company.com",
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Interview Update</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:20px;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">

<!-- Header -->
<tr>
<td style="background:#1976d2;padding:20px;text-align:center;color:#ffffff;">
<h2 style="margin:0;">${companyName}</h2>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:30px;color:#333333;line-height:1.6;">

<p style="margin-top:0;">Dear ${candidateName},</p>

<p>
Thank you for taking the time to interview with us for the 
<strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.
We sincerely appreciate the time and effort you invested throughout the
interview process.
</p>

<p>
After careful consideration following the 
<strong>${stageName}</strong> stage of our hiring process,
we regret to inform you that we will not be progressing with your
application to the next stage.
</p>

<p>
Please understand that this decision was made after reviewing all
candidate profiles against the specific requirements of the role.
While we were impressed by many aspects of your background, we have
chosen to move forward with candidates whose experience more closely
aligns with the current needs of the position.
</p>

<p>
This outcome should not discourage you from applying to future
opportunities at <strong>${companyName}</strong>. We regularly open
new roles and would be happy to review your application again if
a suitable position becomes available.
</p>

<p>
We truly appreciate your interest in joining our team and thank you
again for your time and participation in the interview process.
</p>

<p>
If you have any questions, feel free to reach out to us at 
<a href="mailto:${supportEmail}" style="color:#1976d2;text-decoration:none;">
${supportEmail}
</a>.
</p>

<p>
We wish you continued success in your career and all the best in your
future endeavors.
</p>

<p style="margin-bottom:0;">
Kind regards,<br/>
<strong>${companyName} Recruitment Team</strong>
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#f1f3f5;padding:20px;text-align:center;font-size:12px;color:#777;">
<p style="margin:0;">This message was sent regarding your job application.</p>
<p style="margin:5px 0 0 0;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};

export const offerLetterTemplate = ({ application, offer }) => {
  const candidate = application.candidate;
  const job = application.jobPosting;

  const candidateName =
    `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() ||
    candidate.email.split("@")[0];

  return `
  <html>
  <head>
  <style>

  body{
    font-family: Arial, Helvetica, sans-serif;
    padding:40px;
    line-height:1.7;
    color:#333;
  }

  h1{
    text-align:center;
    letter-spacing:2px;
    margin-bottom:40px;
  }

  .ref{
    margin-bottom:20px;
  }

  .section{
    margin-top:30px;
  }

  .section-title{
    font-weight:bold;
    font-size:18px;
    margin-bottom:10px;
  }

  ul{
    margin-left:20px;
  }

  .signature{
    margin-top:60px;
  }

  </style>
  </head>

  <body>

  <h1>OFFER LETTER</h1>

  <div class="ref">
  <p><strong>Ref No:</strong> ORV/HR/${Math.floor(Math.random() * 10000)}</p>
  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
  </div>

  <p>
  <strong>To,</strong><br/>
  ${candidateName}
  </p>

  <p>Dear ${candidateName},</p>

  <p>
  We are pleased to offer you the position of <strong>${job.title}</strong> at 
  <strong>Orvane Digitals</strong>. This letter outlines the terms, responsibilities,
  confidentiality clauses, and conditions related to your employment with the company.
  </p>

  <div class="section">

  <div class="section-title">1. Position Details</div>

  <p><strong>Position:</strong> ${job.title}</p>
  <p><strong>Joining Date:</strong> ${new Date(offer.joiningDate).toDateString()}</p>
  <p><strong>Offered CTC:</strong> ₹${offer.offeredCTC}</p>

  </div>

  <div class="section">

  <div class="section-title">2. Employment Responsibilities</div>

  <ul>
  <li>Design, develop, and maintain software applications.</li>
  <li>Collaborate with internal development and product teams.</li>
  <li>Follow company coding standards and engineering best practices.</li>
  <li>Complete assigned work responsibly and within deadlines.</li>
  </ul>

  </div>

  <div class="section">

  <div class="section-title">3. Confidentiality & Non-Disclosure</div>

  <p>
  During your employment, you must maintain strict confidentiality regarding
  all company information including:
  </p>

  <ul>
  <li>Client data and company documentation</li>
  <li>Internal software, code repositories, and tools</li>
  <li>Business strategies and operational processes</li>
  <li>Employee or vendor information</li>
  </ul>

  <p>
  Any misuse or disclosure of confidential information may result in disciplinary
  action or termination of employment.
  </p>

  </div>

  <div class="section">

  <div class="section-title">4. Code of Conduct</div>

  <ul>
  <li>You agree to follow all company policies and guidelines.</li>
  <li>Maintain professionalism and ethical conduct.</li>
  <li>Avoid any fraudulent or unethical behavior.</li>
  <li>Ensure assigned responsibilities are completed efficiently.</li>
  </ul>

  </div>

  <div class="section">

  <div class="section-title">5. Termination Clause</div>

  <p>
  The company reserves the right to terminate employment without prior notice
  in case of policy violations, misconduct, breach of confidentiality, or
  unsatisfactory performance.
  </p>

  </div>

  <div class="section">

  <div class="section-title">6. Acceptance of Offer</div>

  <p>
  Please sign below to indicate your acceptance of this offer and the terms
  mentioned in this letter.
  </p>

  </div>

  <div class="signature">

  <p>
  Candidate Signature: ______________________
  </p>

  <p>
  Date: ______________________
  </p>

  <br/>

  <p>
  <strong>Authorized Signatory</strong><br/>
  Orvane Digitals
  </p>

  </div>

  </body>
  </html>
  `;
};

export const offerEmailTemplate = ({
  candidateName,
  jobTitle,
  companyName,
  joiningDate,
  offerUrl,
}) => {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333;">

    <p>Dear ${candidateName},</p>

    <p>
      <strong>Congratulations!</strong> 🎉
    </p>

    <p>
      We are pleased to inform you that you have been selected for the position of 
      <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.
    </p>

    <p>
      Your skills, experience, and enthusiasm during the recruitment process impressed 
      our team, and we are confident that you will be a valuable addition to our organization.
    </p>

    <p>
      Please find your <strong>Offer Letter attached</strong> with this email. The document 
      contains details regarding your role, compensation, and other important terms of employment.
    </p>

    <p>
      To review the offer and confirm your acceptance, please click the button below:
    </p>

    <div style="margin: 25px 0;">
      <a 
        href="${offerUrl}" 
        style="
          background-color: #1976d2;
          color: #ffffff;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          display: inline-block;
        "
      >
        Click URL to Confirm Offer
      </a>
    </div>

    <p style="font-size: 14px; color: #666;">
      If the button above does not work, copy and paste the following link into your browser:
    </p>

    <p style="word-break: break-all; font-size: 14px;">
      ${offerUrl}
    </p>

    ${
      joiningDate
        ? `<p>Your tentative joining date is <strong>${joiningDate}</strong>.</p>`
        : ""
    }

    <p>
      If you have any questions regarding the offer or the onboarding process, feel free 
      to contact our HR team.
    </p>

    <p>
      We look forward to welcoming you to the team and working together to achieve great things.
    </p>

    <br/>

    <p>
      Best Regards,<br/>
      <strong>HR Team</strong><br/>
      ${companyName}
    </p>

  </div>
  `;
};

export const getInviteEmailTemplate = ({
  name,
  role,
  companyName,
  inviteLink,
  password,
  email,
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;background:#f4f6f8;font-family:Arial">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px">
      <tr>
        <td align="center">

          <table width="600" style="background:#fff;border-radius:8px">

            <tr>
              <td style="background:#111827;color:#fff;padding:20px;text-align:center">
                <h2>${companyName}</h2>
              </td>
            </tr>

            <tr>
              <td style="padding:30px;color:#333">

                <h3>Hello ${name},</h3>

                <p>
                  You are invited as <b>${role}</b> to join ${companyName}.
                </p>

                <div style="text-align:center;margin:25px 0">
                  <a href="${inviteLink}" 
                    style="background:#2563eb;color:#fff;padding:12px 20px;text-decoration:none;border-radius:5px">
                    Login to Dashboard
                  </a>  
                </div>

                

                <p><b>Email:</b> ${email}</p>
                <p><b>Password:</b> ${password}</p>

              </td>
            </tr>

            <tr>
              <td style="text-align:center;padding:15px;font-size:12px;color:#888">
                © ${new Date().getFullYear()} ${companyName}
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};

export const generateOrgVerificationEmail = ({
  name,
  organizationName,
  otp,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">HRMS Dashboard</h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <h2 style="margin-top: 0; color: #111827;">Verify Your Email Address</h2>

          <p style="color: #374151; font-size: 14px;">
            Hello <strong>${name || "User"}</strong>,
          </p>

          <p style="color: #374151; font-size: 14px;">
            Thank you for initiating the registration process for your organization 
            <strong>${organizationName}</strong> on our HRMS platform.
          </p>

          <p style="color: #374151; font-size: 14px;">
            To proceed, please verify your email address using the One-Time Password (OTP) below:
          </p>

          <!-- OTP Box -->
          <div style="margin: 25px 0; text-align: center;">
            <span style="display: inline-block; padding: 15px 25px; font-size: 24px; letter-spacing: 4px; font-weight: bold; background: #f3f4f6; border-radius: 6px; color: #111827;">
              ${otp}
            </span>
          </div>

          <p style="color: #374151; font-size: 14px;">
            This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone for security reasons.
          </p>

          <p style="color: #374151; font-size: 14px;">
            If you did not request this verification, you can safely ignore this email.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

          <p style="color: #6b7280; font-size: 12px;">
            Need help? Contact our support team at 
            <a href="mailto:support@hrms.com" style="color: #2563eb;">support@hrms.com</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 15px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} HRMS Dashboard. All rights reserved.
          </p>
        </div>

      </div>
    </div>
    `;
};

export const generateOrganizationSuccessEmail = ({
  name,
  organizationName,
  dashboardUrl = env.client_url,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      <div style="max-width: 620px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a, #4f46e5); padding: 25px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">
            HRMS Dashboard
          </h1>
          <p style="color: #e0e7ff; margin-top: 6px; font-size: 13px;">
            Smart Workforce Management Starts Here
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <h2 style="color: #111827; margin-top: 0;">
            Congratulations, ${name || "User"} 🎉
          </h2>

          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            We’re delighted to inform you that your organization 
            <strong>${organizationName}</strong> has been successfully registered on the 
            <strong>HRMS Dashboard</strong>.
          </p>

          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            You are now part of a growing ecosystem designed to streamline human resource operations, enhance productivity, and simplify workforce management with powerful tools and analytics.
          </p>

          <!-- Highlight Box -->
          <div style="margin: 20px 0; padding: 18px; background: #eef2ff; border-left: 4px solid #4f46e5; border-radius: 6px;">
            <p style="margin: 0; font-size: 14px; color: #1e3a8a;">
              Your organization account is now active and ready to use.
            </p>
          </div>

          <h3 style="color: #111827; font-size: 16px;">What You Can Do Next:</h3>

          <ul style="color: #374151; font-size: 14px; line-height: 1.6; padding-left: 18px;">
            <li>Set up your organization profile and preferences</li>
            <li>Add and manage employees efficiently</li>
            <li>Track attendance, leaves, and payroll</li>
            <li>Leverage insights and reports for better decision-making</li>
          </ul>

          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            We recommend logging in and completing your initial setup to fully unlock the capabilities of the platform.
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 25px 0;">
            <a href=${dashboardUrl} 
               style="background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold;">
               Go to Dashboard
            </a>
          </div>

          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            If you have any questions or need assistance, our support team is always ready to help.
          </p>

          <p style="color: #374151; font-size: 14px;">
            Welcome aboard, and we look forward to supporting your organization’s growth.
          </p>

          <p style="margin-top: 20px; font-size: 14px; color: #111827;">
            Best Regards,<br/>
            <strong>HRMS Dashboard Team</strong>
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

          <p style="font-size: 12px; color: #6b7280;">
            Need help? Contact us at 
            <a href="mailto:support@hrms.com" style="color: #2563eb;">support@hrms.com</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 15px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} HRMS Dashboard. All rights reserved.
          </p>
        </div>

      </div>
    </div>
    `;
};
