// Vercel Edge/Serverless Function: SePay Payment Verification Proxy (Bypasses Browser CORS)
export const config = {
  runtime: 'edge',
};

const SEPAY_API_KEY = 'FKPE7WUO0B8XDZXM5H9VODCLZGVAVQNE5NXRVLR7C2SIIQSYP4ITWE6LK4JAFF89';
const ACCOUNT_NUMBER = '8606120325604';

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const code = (url.searchParams.get('code') || '').trim().toUpperCase();
  const minAmount = parseFloat(url.searchParams.get('minAmount') || '50000');

  try {
    const sepayUrl = `https://my.sepay.vn/userapi/transactions/list?account_number=${ACCOUNT_NUMBER}&limit=30`;
    const response = await fetch(sepayUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SEPAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ paid: false, error: 'SePay API error' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const data = await response.json();
    const transactions = data.transactions || [];

    // 1. Check if specific order code is present with amount >= minAmount
    if (code) {
      for (const tx of transactions) {
        const amount = typeof tx.amount_in === 'string' ? parseFloat(tx.amount_in) : tx.amount_in;
        const content = (tx.transaction_content || '').toUpperCase();

        if (amount >= minAmount && content.includes(code)) {
          return new Response(
            JSON.stringify({
              paid: true,
              matchedBy: 'code',
              transaction: tx,
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store',
              },
            }
          );
        }
      }
    }

    return new Response(
      JSON.stringify({
        paid: false,
        totalChecked: transactions.length,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store',
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ paid: false, error: (err as Error).message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
