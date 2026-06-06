export async function initializeChapaPayment({
  amount, email, firstName, txRef, callbackUrl, returnUrl
}: {
  amount: number;
  email: string;
  firstName: string;
  txRef: string;
  callbackUrl: string;
  returnUrl: string;
}) {
  const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount.toString(),
      currency: 'ETB',
      email,
      first_name: firstName,
      tx_ref: txRef,
      callback_url: callbackUrl,
      return_url: returnUrl,
    }),
  });
  return response.json();
}

export async function verifyChapaPayment(txRef: string) {
  const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
    headers: {
      'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
    },
  });
  return response.json();
}

export const CHALLENGE_PRICES: Record<string, number> = {
  starter: 1500,
  standard: 3000,
  pro: 7000,
  elite: 12000,
  legend: 20000,
};

export const CHALLENGE_VIRTUAL: Record<string, number> = {
  starter: 5000,
  standard: 10000,
  pro: 25000,
  elite: 50000,
  legend: 100000,
};
