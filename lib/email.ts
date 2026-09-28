import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderEmailItem = {
  productName: string;
  sku: string;
  size: string;
  colour: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type NewOrderEmailData = {
  orderNumber: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentStatus: string;
  items: OrderEmailItem[];
};

export async function sendNewOrderEmail(order: NewOrderEmailData) {
  const emailSetting = await prisma.storeSetting.findUnique({
    where: {
      key: "support_email",
    },
    select: {
      value: true,
    },
  });

  const supportEmail = emailSetting?.value.trim();

  if (!supportEmail) {
    throw new Error("Support email has not been configured.");
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const itemLines = order.items
    .map(
      (item) =>
        `${item.productName} | ${item.colour} | Size ${item.size} | Qty: ${item.quantity} | ₦${item.unitPrice.toLocaleString()} each | ₦${item.total.toLocaleString()}`
    )
    .join("\n");

  const { error } = await resend.emails.send({
    from: "Tricea NG <support@triceang.com>",
    to: supportEmail,
    replyTo: order.email,
    subject: `New Order: ${order.orderNumber}`,
    text: [
      "TRICEA NG — NEW ORDER",
      "",
      `Order Number: ${order.orderNumber}`,
      "",
      "CUSTOMER DETAILS",
      `Name: ${order.fullName}`,
      `Email: ${order.email}`,
      `Phone: ${order.phone}`,
      "",
      "DELIVERY DETAILS",
      `Address: ${order.address}`,
      `City: ${order.city}`,
      `State: ${order.state}`,
      "",
      "ORDER ITEMS",
      itemLines,
      "",
      "ORDER SUMMARY",
      `Subtotal: ₦${order.subtotal.toLocaleString()}`,
      `Delivery Fee: ₦${order.deliveryFee.toLocaleString()}`,
      `Total: ₦${order.total.toLocaleString()}`,
      "",
      "PAYMENT",
      "Method: Bank Transfer",
      `Status: ${order.paymentStatus}`,
      "",
      order.notes ? `CUSTOMER NOTES:\n${order.notes}` : "",
      "",
      "Please check the Tricea NG admin dashboard for the full order details.",
    ].join("\n"),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendOrderConfirmationEmail(
  order: NewOrderEmailData & {
    paymentBankName: string;
    paymentAccountName: string;
    paymentAccountNumber: string;
  }
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const itemLines = order.items
    .map(
      (item) =>
        `${item.productName} | ${item.colour} | Size ${item.size} | Qty: ${item.quantity} | ₦${item.unitPrice.toLocaleString()} each | ₦${item.total.toLocaleString()}`
    )
    .join("\n");

  const { error } = await resend.emails.send({
    from: "Tricea NG <support@triceang.com>",
    to: order.email,
    subject: `Order Confirmed: ${order.orderNumber}`,
    text: [
      `Hello ${order.fullName},`,
      "",
      "Thank you for shopping with Tricea NG.",
      "Your order has been received successfully.",
      "",
      "ORDER DETAILS",
      `Order Number: ${order.orderNumber}`,
      "",
      "ITEMS",
      itemLines,
      "",
      "ORDER SUMMARY",
      `Subtotal: ₦${order.subtotal.toLocaleString()}`,
      `Delivery Fee: ₦${order.deliveryFee.toLocaleString()}`,
      `Total: ₦${order.total.toLocaleString()}`,
      "",
      "DELIVERY DETAILS",
      `Address: ${order.address}`,
      `City: ${order.city}`,
      `State: ${order.state}`,
      "",
      "PAYMENT",
      "Method: Bank Transfer",
      `Status: ${order.paymentStatus}`,
      "",
      "BANK TRANSFER DETAILS",
      `Bank: ${order.paymentBankName}`,
      `Account Name: ${order.paymentAccountName}`,
      `Account Number: ${order.paymentAccountNumber}`,
      "",
      "Please use your order number as your payment reference where applicable.",
      "",
      "We will process your order once your payment has been confirmed.",
      "",
      "Thank you for choosing Tricea NG.",
      "",
      "— Tricea NG",
    ].join("\n"),
  });

  if (error) {
    throw new Error(error.message);
  }
}