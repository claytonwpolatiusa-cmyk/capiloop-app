import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

export class MercadoPagoConfigurationError extends Error {
  constructor() {
    super("A integração de pagamento ainda não está configurada.");
    this.name = "MercadoPagoConfigurationError";
  }
}

export type MercadoPagoPayment = {
  id: string;
  status: string;
  statusDetail: string | null;
  qrCode: string | null;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
  externalReference: string | null;
};

export type MercadoPagoCheckoutPreference = {
  id: string;
  initPoint: string;
};

type PaymentInput = {
  amount: number;
  description: string;
  payerEmail: string;
  externalReference: string;
  idempotencyKey: string;
};

function getClient() {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
  if (!accessToken) throw new MercadoPagoConfigurationError();
  return new Payment(new MercadoPagoConfig({ accessToken }));
}

function getPreferenceClient() {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
  if (!accessToken) throw new MercadoPagoConfigurationError();
  return new Preference(new MercadoPagoConfig({ accessToken }));
}

function notificationUrl() {
  return process.env.MERCADO_PAGO_WEBHOOK_URL?.trim() || undefined;
}

function normalizePayment(payment: any): MercadoPagoPayment {
  return {
    id: String(payment.id),
    status: String(payment.status ?? "pending"),
    statusDetail: payment.status_detail ? String(payment.status_detail) : null,
    qrCode: payment.point_of_interaction?.transaction_data?.qr_code ?? null,
    qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
    ticketUrl: payment.point_of_interaction?.transaction_data?.ticket_url ?? null,
    externalReference: payment.external_reference ? String(payment.external_reference) : null,
  };
}

export function isMercadoPagoConfigured() {
  return Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim());
}

export async function createPixPayment(input: PaymentInput): Promise<MercadoPagoPayment> {
  const payment = await getClient().create({
    body: {
      transaction_amount: input.amount,
      description: input.description,
      payment_method_id: "pix",
      payer: { email: input.payerEmail },
      external_reference: input.externalReference,
      notification_url: notificationUrl(),
    },
    requestOptions: { idempotencyKey: input.idempotencyKey },
  });
  return normalizePayment(payment);
}

export async function createCardPayment(
  input: PaymentInput & { cardToken: string; paymentMethodId: string; installments: number; issuerId?: string },
): Promise<MercadoPagoPayment> {
  const payment = await getClient().create({
    body: {
      token: input.cardToken,
      transaction_amount: input.amount,
      description: input.description,
      installments: input.installments,
      payment_method_id: input.paymentMethodId,
      issuer_id: input.issuerId ? Number(input.issuerId) : undefined,
      payer: { email: input.payerEmail },
      external_reference: input.externalReference,
      notification_url: notificationUrl(),
    },
    requestOptions: { idempotencyKey: input.idempotencyKey },
  });
  return normalizePayment(payment);
}

export async function createCheckoutPreference(input: PaymentInput): Promise<MercadoPagoCheckoutPreference> {
  const checkout = await getPreferenceClient().create({
    body: {
      items: [
        {
          id: input.externalReference,
          title: input.description,
          quantity: 1,
          unit_price: input.amount,
          currency_id: "BRL",
        },
      ],
      payer: { email: input.payerEmail },
      external_reference: input.externalReference,
      notification_url: notificationUrl(),
      auto_return: "approved",
      back_urls: {
        success: "capiloop://checkout/result?status=approved",
        pending: "capiloop://checkout/result?status=pending",
        failure: "capiloop://checkout/result?status=failed",
      },
      payment_methods: { installments: 12 },
    },
    requestOptions: { idempotencyKey: input.idempotencyKey },
  });

  if (!checkout.id || !checkout.init_point) {
    throw new Error("O Mercado Pago não retornou uma preferência de checkout válida.");
  }
  return { id: String(checkout.id), initPoint: checkout.init_point };
}

export async function getMercadoPagoPayment(paymentId: string): Promise<MercadoPagoPayment> {
  const payment = await getClient().get({ id: paymentId });
  return normalizePayment(payment);
}
