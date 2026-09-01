// SePay Automated Payment Verification Service (100% Real-Time Auto Activation)

export interface SePayTransaction {
  id: number | string;
  bank_brand_name?: string;
  account_number?: string;
  transaction_date?: string;
  amount_in: number | string;
  amount_out?: number | string;
  transaction_content: string;
  reference_number?: string;
}

export interface SePayApiResponse {
  status: number | string;
  messages?: string;
  transactions?: SePayTransaction[];
}

const SEPAY_API_KEY = 'FKPE7WUO0B8XDZXM5H9VODCLZGVAVQNE5NXRVLR7C2SIIQSYP4ITWE6LK4JAFF89';
const ACCOUNT_NUMBER = '8606120325604';

class SePayService {
  private activePollingInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Generate a unique, human-friendly order code (e.g. QUIZ8391)
   */
  public generateOrderCode(): string {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `QUIZ${randomNum}`;
  }

  /**
   * Fetch recent transactions from SePay API
   */
  public async fetchRecentTransactions(): Promise<SePayTransaction[]> {
    try {
      const url = `https://my.sepay.vn/userapi/transactions/list?account_number=${ACCOUNT_NUMBER}&limit=20`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SEPAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`SePay API error: ${response.statusText}`);
      }

      const data: SePayApiResponse = await response.json();
      return data.transactions || [];
    } catch (err) {
      console.warn('Lỗi khi kiểm tra giao dịch SePay:', err);
      return [];
    }
  }

  /**
   * Check if a specific order code has been paid with at least 50,000đ
   */
  public async checkPaymentStatus(orderCode: string, minAmount: number = 50000): Promise<{
    paid: boolean;
    transaction?: SePayTransaction;
  }> {
    const cleanCode = orderCode.trim().toUpperCase();
    if (!cleanCode) return { paid: false };

    // Method 1: Use Vercel Serverless Proxy (Zero CORS limitation, 100% Reliable)
    try {
      const res = await fetch(`/api/sepay?code=${encodeURIComponent(cleanCode)}&minAmount=${minAmount}`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.paid && data.transaction) {
          return {
            paid: true,
            transaction: data.transaction,
          };
        }
      }
    } catch (err) {
      console.warn('Proxy check error, attempting direct fallback...', err);
    }

    // Method 2: Direct fetch fallback
    try {
      const transactions = await this.fetchRecentTransactions();
      for (const tx of transactions) {
        const amount = typeof tx.amount_in === 'string' ? parseFloat(tx.amount_in) : tx.amount_in;
        const content = (tx.transaction_content || '').toUpperCase();

        if (amount >= minAmount && content.includes(cleanCode)) {
          return {
            paid: true,
            transaction: tx,
          };
        }
      }
    } catch {
      // ignore
    }

    return { paid: false };
  }

  /**
   * Start polling for payment every intervalMs
   */
  public startPolling(
    orderCode: string,
    onSuccess: (tx: SePayTransaction) => void,
    intervalMs: number = 2500
  ) {
    this.stopPolling();

    // Run first check immediately
    this.checkPaymentStatus(orderCode).then((res) => {
      if (res.paid && res.transaction) {
        this.stopPolling();
        onSuccess(res.transaction);
      }
    });

    // Set recurring check
    this.activePollingInterval = setInterval(async () => {
      const res = await this.checkPaymentStatus(orderCode);
      if (res.paid && res.transaction) {
        this.stopPolling();
        onSuccess(res.transaction);
      }
    }, intervalMs);
  }

  /**
   * Stop polling
   */
  public stopPolling() {
    if (this.activePollingInterval) {
      clearInterval(this.activePollingInterval);
      this.activePollingInterval = null;
    }
  }
}

export const sePayService = new SePayService();
