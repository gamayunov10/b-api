interface IPaymentAdapter {
  createPayment(payment: any): { data: any; url: string };
}

enum PaymentSystemsTypes {
  Paypal = 'paypal',
  Stripe = 'stripe',
}
export class PaymentManager {
  adapters: Partial<Record<PaymentSystemsTypes, IPaymentAdapter>> = {};

  constructor(paypalAdapter: any, stripeAdapter: any) {
    this.adapters[PaymentSystemsTypes.Paypal] = paypalAdapter;
    this.adapters[PaymentSystemsTypes.Stripe] = stripeAdapter;
  }

  createPayment(payment: any) {
    return this.adapters[payment.paymentSystemType].createPayment(payment);
  }
}
