export interface PaymentProvider {
  initiate(amount: number, method: string, referenceId: string): Promise<{ success: boolean; transactionId?: string; url?: string }>;
  verifyWebhook(payload: any): Promise<{ success: boolean; transactionId: string; status: string }>;
  refund(transactionId: string): Promise<{ success: boolean }>;
}

class MockPaymentProvider implements PaymentProvider {
  async initiate(amount: number, method: string, referenceId: string) {
    // In a real system, this would call the Lypay, mypay, or T-Lync APIs.
    console.log(`Initiating payment of ${amount} via ${method} for ref ${referenceId}`);
    return { success: true, transactionId: `txn_${Date.now()}` };
  }

  async verifyWebhook(payload: any) {
    // Verify provider signature
    console.log('Verifying webhook', payload);
    return { success: true, transactionId: payload.transactionId, status: 'completed' };
  }

  async refund(transactionId: string) {
    console.log(`Refunding ${transactionId}`);
    return { success: true };
  }
}

export const paymentAdapter = new MockPaymentProvider();
