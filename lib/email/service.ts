/**
 * Client-side & server-side dispatch service for BZ Group transaction notifications.
 */
import type { TransactionEmailData } from './template';

export async function sendTransactionEmail(
  payload: Partial<TransactionEmailData> & {
    recipientEmail: string;
    recipientName: string;
    transactionId: string;
    amountFormatted: string;
  }
): Promise<boolean> {
  try {
    const res = await fetch('/api/notifications/send-transaction-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.warn('sendTransactionEmail HTTP error:', res.status);
      return false;
    }

    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('sendTransactionEmail fetch error:', err);
    return false;
  }
}
