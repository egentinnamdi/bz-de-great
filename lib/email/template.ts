/**
 * High-conversion, brand-accurate, luxury HTML email template generator for BZ Group.
 * Compatible with Gmail, Apple Mail, Outlook, Yahoo Mail, and iOS/Android clients.
 */

export interface TransactionEmailData {
  recipientEmail: string;
  recipientName: string;
  transactionId: string;
  transactionType:
    | 'rmb_to_naira'
    | 'naira_to_rmb'
    | 'car_rental'
    | 'car_test_drive'
    | 'property_inspection';
  event:
    | 'order_submitted'
    | 'receipt_uploaded'
    | 'approved'
    | 'paid_out'
    | 'rejected'
    | 'status_updated';
  statusDisplay: string;
  statusBadgeColor?: 'amber' | 'emerald' | 'blue' | 'rose';
  amountFormatted: string;
  sourceAmountFormatted?: string;
  rateAppliedFormatted?: string;
  payoutDetails?: string;
  scheduledDates?: string;
  pickupLocation?: string;
  assetTitle?: string;
  receiptUrl?: string;
  adminNotes?: string;
  actionUrl: string;
}

export function generateTransactionEmailHtml(data: TransactionEmailData): string {
  const badgeBg =
    data.statusBadgeColor === 'emerald'
      ? '#ecfdf5'
      : data.statusBadgeColor === 'blue'
      ? '#eff6ff'
      : data.statusBadgeColor === 'rose'
      ? '#fef2f2'
      : '#fef3c7';

  const badgeColor =
    data.statusBadgeColor === 'emerald'
      ? '#065f46'
      : data.statusBadgeColor === 'blue'
      ? '#1e40af'
      : data.statusBadgeColor === 'rose'
      ? '#991b1b'
      : '#92400e';

  const typeLabel =
    data.transactionType === 'rmb_to_naira'
      ? 'RMB to Naira Currency Trade'
      : data.transactionType === 'naira_to_rmb'
      ? 'Naira to RMB Currency Trade'
      : data.transactionType === 'car_rental'
      ? 'VIP Vehicle Rental Agreement'
      : data.transactionType === 'car_test_drive'
      ? 'Chauffeured Test Drive Reservation'
      : 'Luxury Property Inspection Walkthrough';

  const headline =
    data.event === 'order_submitted' || data.event === 'receipt_uploaded'
      ? 'Transfer Proof Logged · Verification In Progress'
      : data.event === 'paid_out'
      ? 'Transaction Disbursed & Completed'
      : data.event === 'approved'
      ? 'Payment Approved · Disbursement Queued'
      : data.event === 'rejected'
      ? 'Important Notice Regarding Your Transfer Slip'
      : 'Status Update on Your Transaction';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline} - ${data.transactionId}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f7f5f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1b1416;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td {
      padding: 0;
    }
    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      display: block;
    }
    a {
      text-decoration: none;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1b1416;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f5f5; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #eae3e4; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #4e0b13; padding: 28px 32px; text-align: center; border-bottom: 2px solid #7A0C1A;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <span style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; letter-spacing: 0.15em; color: #ffffff; display: block;">
                      BZ GROUP
                    </span>
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; color: #ebc7cb; display: block; margin-top: 6px;">
                      Invest in Value · Live the Future
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subheader / Eyebrow -->
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.12em; color: #7A0C1A; display: block;">
                Official Confirmation Notice
              </span>
              <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: bold; color: #1b1416; margin: 8px 0 0 0; line-height: 1.3;">
                ${headline}
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #4a4245; margin: 12px 0 0 0;">
                Dear <strong>${data.recipientName}</strong>,<br>
                This email confirms that your <strong>${typeLabel}</strong> has been logged in our treasury and concierge systems. You can review your transaction ID, live verification status, and attached transfer slip below.
              </p>
            </td>
          </tr>

          <!-- Key Ticket Details Box -->
          <tr>
            <td style="padding: 12px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fbf9f9; border-radius: 12px; border: 1px solid #eae3e4; overflow: hidden;">
                <!-- Ticket ID Row -->
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #eae3e4;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="font-size: 11px; text-transform: uppercase; color: #716769; font-weight: 600; display: block;">
                            Transaction Reference ID
                          </span>
                          <span style="font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #7A0C1A; letter-spacing: 0.05em; margin-top: 2px; display: block;">
                            ${data.transactionId}
                          </span>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; background-color: ${badgeBg}; color: ${badgeColor};">
                            ${data.statusDisplay}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Summary Grid -->
                <tr>
                  <td style="padding: 18px 20px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      ${
                        data.assetTitle
                          ? `<tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #716769;">Asset / Service:</td>
                              <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1b1416;">${data.assetTitle}</td>
                            </tr>`
                          : ''
                      }
                      ${
                        data.sourceAmountFormatted
                          ? `<tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #716769;">Amount Sent by You:</td>
                              <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1b1416;">${data.sourceAmountFormatted}</td>
                            </tr>`
                          : ''
                      }
                      ${
                        data.rateAppliedFormatted
                          ? `<tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #716769;">Locked Rate Applied:</td>
                              <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #7A0C1A;">${data.rateAppliedFormatted}</td>
                            </tr>`
                          : ''
                      }
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #716769;">Disbursement / Total:</td>
                        <td align="right" style="padding: 6px 0; font-size: 16px; font-weight: bold; color: #047857;">${data.amountFormatted}</td>
                      </tr>
                      ${
                        data.payoutDetails
                          ? `<tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #716769;">Payout Destination:</td>
                              <td align="right" style="padding: 6px 0; font-size: 12px; font-weight: 600; color: #1b1416; font-family: monospace;">${data.payoutDetails}</td>
                            </tr>`
                          : ''
                      }
                      ${
                        data.scheduledDates
                          ? `<tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #716769;">Scheduled Schedule:</td>
                              <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1b1416;">${data.scheduledDates}</td>
                            </tr>`
                          : ''
                      }
                      ${
                        data.pickupLocation
                          ? `<tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #716769;">Location:</td>
                              <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1b1416;">${data.pickupLocation}</td>
                            </tr>`
                          : ''
                      }
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #716769;">Receipt Slip:</td>
                        <td align="right" style="padding: 6px 0; font-size: 12px; font-weight: 600; color: #7A0C1A;">
                          ${data.receiptUrl ? '✓ Attached &amp; Uploaded to Treasury' : 'Pending Upload'}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            data.adminNotes
              ? `<!-- Admin Notes Box -->
              <tr>
                <td style="padding: 8px 32px;">
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px;">
                    <tr>
                      <td>
                        <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #b91c1c; display: block;">Desk Communication:</span>
                        <p style="font-size: 13px; color: #991b1b; margin: 4px 0 0 0; line-height: 1.5;">${data.adminNotes}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`
              : ''
          }

          <!-- Primary Call-to-Action Button -->
          <tr>
            <td style="padding: 24px 32px 16px 32px; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${data.actionUrl}" target="_blank" style="display: inline-block; background-color: #7A0C1A; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 16px 36px; border-radius: 10px; box-shadow: 0 4px 12px rgba(122,12,26,0.25); text-align: center;">
                      Track Transaction &amp; View Receipt on Site &rarr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <span style="font-size: 11px; color: #716769;">
                      Direct link: <a href="${data.actionUrl}" style="color: #7A0C1A; word-break: break-all;">${data.actionUrl}</a>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Direct Human Assistance / WhatsApp Section -->
          <tr>
            <td style="padding: 16px 32px 28px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #eae3e4; padding-top: 20px;">
                <tr>
                  <td>
                    <span style="font-size: 12px; font-weight: bold; color: #1b1416; display: block;">
                      Need immediate confirmation or bank statement assistance?
                    </span>
                    <p style="font-size: 12px; color: #716769; margin: 4px 0 10px 0; line-height: 1.5;">
                      Our treasury officers and concierges operate 24/7 on WhatsApp to confirm RMB transfers, assign security chauffeurs, and schedule private estate viewings.
                    </p>
                    <a href="https://wa.me/2348139690031?text=Hello%20BZ%20Group%20Treasury,%20I%20am%20following%20up%20on%20my%20Transaction%20Ticket%20${data.transactionId}..." target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; font-size: 12px; font-weight: 700; text-decoration: none; padding: 8px 16px; border-radius: 6px;">
                      Chat with Treasury Desk on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Footnote -->
          <tr>
            <td style="background-color: #faf7f7; padding: 24px 32px; border-top: 1px solid #eae3e4; text-align: center;">
              <p style="font-size: 11px; color: #716769; margin: 0; line-height: 1.6;">
                BZ Global Universal Solutions Ltd · Maitama &amp; Central Business District, Abuja, Nigeria.<br>
                Hotline: +234 813 969 0031 · Email: treasury@bzdegreat.com · <a href="https://bzdegreat.com" style="color: #7A0C1A;">bzdegreat.com</a>
              </p>
              <p style="font-size: 10px; color: #a19597; margin: 10px 0 0 0;">
                This is a secure automated notification regarding transaction reference <strong>${data.transactionId}</strong>. If you did not initiate this transaction, please report it immediately to our security desk.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
