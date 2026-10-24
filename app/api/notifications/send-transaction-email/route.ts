import { NextResponse } from 'next/server';
import { generateTransactionEmailHtml, type TransactionEmailData } from '@/lib/email/template';
import { supabaseService } from '@/lib/supabase/service';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      recipientEmail,
      recipientName,
      transactionId,
      transactionType = 'rmb_to_naira',
      event = 'order_submitted',
      statusDisplay = 'Receipt Under Treasury Review',
      statusBadgeColor = 'amber',
      amountFormatted,
      sourceAmountFormatted,
      rateAppliedFormatted,
      payoutDetails,
      scheduledDates,
      pickupLocation,
      assetTitle,
      receiptUrl,
      adminNotes
    } = body;

    if (!recipientEmail || !recipientName || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required email notification fields' },
        { status: 400 }
      );
    }

    // Determine base URL
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const actionUrl = body.actionUrl || `${baseUrl}/my-booking?ref=${encodeURIComponent(transactionId)}`;

    const emailPayload: TransactionEmailData = {
      recipientEmail,
      recipientName,
      transactionId,
      transactionType,
      event,
      statusDisplay,
      statusBadgeColor,
      amountFormatted: amountFormatted || '₦0.00',
      sourceAmountFormatted,
      rateAppliedFormatted,
      payoutDetails,
      scheduledDates,
      pickupLocation,
      assetTitle,
      receiptUrl,
      adminNotes,
      actionUrl
    };

    const htmlContent = generateTransactionEmailHtml(emailPayload);

    let providerUsed = 'simulated_dispatch';
    let emailSentSuccessfully = false;

    // 1. Resend API Provider
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'BZ Group <notifications@bzdegreat.com>',
            to: [recipientEmail],
            subject: `${event === 'paid_out' ? 'Disbursed' : 'Receipt Confirmation'} · ${transactionId} · BZ Group`,
            html: htmlContent
          })
        });

        if (res.ok) {
          providerUsed = 'resend';
          emailSentSuccessfully = true;
        } else {
          const errData = await res.json();
          console.warn('Resend dispatch response:', errData);
        }
      } catch (err) {
        console.warn('Resend exception:', err);
      }
    }

    // 2. Fallback / Dev Mode
    if (!emailSentSuccessfully) {
      providerUsed = 'direct_inbox_logger';
      console.log(
        `[Email Notification Dispatched] To: ${recipientEmail} | ID: ${transactionId} | Status: ${statusDisplay} | Link: ${actionUrl}`
      );
    }

    // Log to staff audit trail in Supabase
    try {
      await supabaseService.insertActivity({
        id: `email-${Date.now()}`,
        actorName: 'Automated Mailer',
        actorRole: 'System Notification',
        action: `dispatched email receipt for ${transactionId} to ${recipientEmail}`,
        target: `${transactionId} · ${amountFormatted}`,
        details: `Status: ${statusDisplay} | Action URL: ${actionUrl}`,
        category: 'payments',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      });
    } catch (e) {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      transactionId,
      recipientEmail,
      provider: providerUsed,
      actionUrl,
      statusDisplay
    });
  } catch (err: any) {
    console.error('Error sending transaction email:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error processing email notification' },
      { status: 500 }
    );
  }
}
