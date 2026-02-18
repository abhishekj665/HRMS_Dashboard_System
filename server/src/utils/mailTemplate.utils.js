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
