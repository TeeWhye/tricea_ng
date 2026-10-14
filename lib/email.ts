import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderEmailItem = {
  productName: string;
  sku: string;
  size: string;
  colour: string;
  customSpecifications?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
};

type NewOrderEmailData = {
  orderNumber: string;
  trackingToken?: string;
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

const BRAND = {
  burgundy: "#5a1826",
  wine: "#731f32",
  rose: "#a74761",
  ivory: "#f8f3ef",
  surface: "#fffdfb",
  charcoal: "#1c1819",
  muted: "#756c6e",
  border: "#e7deda",
  champagne: "#c8a77a",
};

function escapeHtml(value: string | null | undefined): string {
  return (value ?? "").replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function formatMoney(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function formatLabel(value: string): string {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getEmailStyles(): string {
  return `
    body {
      margin: 0;
      padding: 0;
      background-color: ${BRAND.ivory};
      color: ${BRAND.charcoal};
      font-family: Arial, Helvetica, sans-serif;
      -webkit-text-size-adjust: 100%;
    }

    table {
      border-collapse: collapse;
    }

    .email-wrapper {
      width: 100%;
      background-color: ${BRAND.ivory};
      padding: 32px 12px;
    }

    .email-container {
      width: 100%;
      max-width: 620px;
      margin: 0 auto;
      background-color: ${BRAND.surface};
      border: 1px solid ${BRAND.border};
    }

    .brand-header {
      background-color: ${BRAND.burgundy};
      padding: 32px 24px;
      text-align: center;
    }

    .brand-name {
      margin: 0;
      color: #ffffff;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 30px;
      font-weight: normal;
      letter-spacing: 4px;
    }

    .brand-caption {
      margin: 10px 0 0;
      color: #f0dfe2;
      font-size: 10px;
      letter-spacing: 3px;
    }

    .email-content {
      padding: 32px 28px;
    }

    .eyebrow {
      margin: 0 0 12px;
      color: ${BRAND.rose};
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    h1 {
      margin: 0 0 16px;
      color: ${BRAND.burgundy};
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 29px;
      font-weight: normal;
      line-height: 1.3;
    }

    h2 {
      margin: 0;
      color: ${BRAND.burgundy};
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 19px;
      font-weight: normal;
    }

    p {
      font-size: 14px;
      line-height: 1.8;
    }

    .intro {
      color: ${BRAND.muted};
      margin: 0 0 24px;
    }

    .order-banner {
      background-color: ${BRAND.ivory};
      border-left: 4px solid ${BRAND.champagne};
      padding: 18px 20px;
      margin: 24px 0;
    }

    .order-label {
      color: ${BRAND.muted};
      font-size: 10px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .order-number {
      display: block;
      margin-top: 8px;
      color: ${BRAND.burgundy};
      font-size: 19px;
      font-weight: bold;
      overflow-wrap: anywhere;
    }

    .section {
      margin-top: 30px;
    }

    .section-heading {
      padding-bottom: 12px;
      border-bottom: 1px solid ${BRAND.border};
    }

    .detail-table,
    .item-table,
    .summary-table {
      width: 100%;
      margin-top: 12px;
    }

    .detail-table td {
      padding: 7px 0;
      vertical-align: top;
      font-size: 13px;
      line-height: 1.6;
      overflow-wrap: anywhere;
    }

    .detail-label {
      width: 36%;
      padding-right: 12px !important;
      color: ${BRAND.muted};
    }

    .detail-value {
      color: ${BRAND.charcoal};
      overflow-wrap: anywhere;
    }

    .item-table th {
      background-color: ${BRAND.ivory};
      color: ${BRAND.muted};
      font-size: 10px;
      letter-spacing: 1px;
      text-align: left;
      text-transform: uppercase;
      padding: 12px 8px;
    }

    .item-table td {
      border-bottom: 1px solid ${BRAND.border};
      padding: 15px 8px;
      vertical-align: top;
      font-size: 12px;
      line-height: 1.7;
      overflow-wrap: anywhere;
    }

    .item-name {
      color: ${BRAND.burgundy};
      font-size: 14px;
      font-weight: bold;
    }

    .item-meta {
      color: ${BRAND.muted};
      font-size: 12px;
    }

    .customisation {
      display: block;
      margin-top: 8px;
      padding: 8px;
      background-color: ${BRAND.ivory};
      color: ${BRAND.charcoal};
      font-size: 12px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .summary-table td {
      padding: 10px 0;
      font-size: 13px;
    }

    .summary-label {
      color: ${BRAND.muted};
    }

    .summary-value {
      text-align: right;
      color: ${BRAND.charcoal};
    }

    .total-row td {
      padding-top: 16px;
      border-top: 1px solid ${BRAND.border};
      color: ${BRAND.burgundy};
      font-size: 17px;
      font-weight: bold;
    }

    .payment-card {
      margin-top: 16px;
      padding: 20px;
      border: 1px solid ${BRAND.border};
      background-color: ${BRAND.surface};
    }

    .payment-card table {
      width: 100%;
    }

    .payment-card td {
      padding: 9px 0;
      border-bottom: 1px solid ${BRAND.border};
      font-size: 13px;
      line-height: 1.6;
      overflow-wrap: anywhere;
    }

    .payment-card tr:last-child td {
      border-bottom: none;
    }

    .payment-status {
      display: inline-block;
      padding: 6px 10px;
      background-color: ${BRAND.ivory};
      color: ${BRAND.burgundy};
      font-size: 11px;
      font-weight: bold;
    }

    .notice {
      margin-top: 20px;
      padding: 16px;
      background-color: ${BRAND.ivory};
      color: ${BRAND.muted};
      font-size: 12px;
      line-height: 1.8;
    }

    .admin-button {
      display: inline-block;
      margin-top: 24px;
      padding: 14px 22px;
      background-color: ${BRAND.burgundy};
      color: #ffffff !important;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 1px;
      text-decoration: none;
    }

    .email-footer {
      padding: 24px;
      border-top: 1px solid ${BRAND.border};
      text-align: center;
      color: ${BRAND.muted};
      font-size: 11px;
      line-height: 1.8;
    }

    .footer-brand {
      color: ${BRAND.burgundy};
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 17px;
      letter-spacing: 2px;
    }

    @media only screen and (max-width: 480px) {
      .email-content {
        padding: 24px 16px;
      }

      .brand-header {
        padding: 26px 16px;
      }

      .brand-name {
        font-size: 25px;
      }

      h1 {
        font-size: 25px;
      }

      .item-table th,
      .item-table td {
        padding: 10px 5px;
      }

      .detail-label {
        width: 34%;
      }
    }
  `;
}

function renderEmailShell(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>Tricea NG</title>
  <style>${getEmailStyles()}</style>
</head>
<body>
  <table role="presentation" class="email-wrapper" width="100%">
    <tr>
      <td align="center">
        <table
          role="presentation"
          class="email-container"
          width="100%"
          style="max-width:620px"
        >
          <tr>
            <td class="brand-header">
              <p class="brand-name">TRICEA NG</p>
              <p class="brand-caption">CRAFTED FOR DISTINCTION</p>
            </td>
          </tr>
          <tr>
            <td class="email-content">
              ${content}
            </td>
          </tr>
          <tr>
            <td class="email-footer">
              <p class="footer-brand">TRICEA NG</p>
              <p>
                Thank you for choosing us.<br />
                Crafted with care. Made to stand out.
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

function renderOrderItems(items: OrderEmailItem[]): string {
  return `
    <table role="presentation" class="item-table" width="100%">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map((item) => {
            const customisation = item.customSpecifications?.trim();

            return `
              <tr>
                <td>
                  <span class="item-name">${escapeHtml(item.productName)}</span>
                  <br />
                  <span class="item-meta">
                    Colour: ${escapeHtml(item.colour)}
                    <br />
                    Size: ${escapeHtml(item.size)}
                    <br />
                    SKU: ${escapeHtml(item.sku)}
                    <br />
                    ${formatMoney(item.unitPrice)} each
                  </span>
                  ${
                    customisation
                      ? `
                        <span class="customisation">
                          <strong>Customisation request:</strong><br />
                          ${escapeHtml(customisation).replace(/\n/g, "<br />")}
                        </span>
                      `
                      : ""
                  }
                </td>
                <td>${item.quantity}</td>
                <td><strong>${formatMoney(item.total)}</strong></td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function renderOrderSummary(order: NewOrderEmailData): string {
  return `
    <table role="presentation" class="summary-table" width="100%">
      <tr>
        <td class="summary-label">Subtotal</td>
        <td class="summary-value">${formatMoney(order.subtotal)}</td>
      </tr>
      <tr class="total-row">
        <td>Total</td>
        <td class="summary-value">${formatMoney(order.total)}</td>
      </tr>
    </table>
  `;
}

function renderCustomerDetails(order: NewOrderEmailData): string {
  return `
    <table role="presentation" class="detail-table" width="100%">
      <tr>
        <td class="detail-label">Full name</td>
        <td class="detail-value">${escapeHtml(order.fullName)}</td>
      </tr>
      <tr>
        <td class="detail-label">Email</td>
        <td class="detail-value">${escapeHtml(order.email)}</td>
      </tr>
      <tr>
        <td class="detail-label">Phone</td>
        <td class="detail-value">${escapeHtml(order.phone)}</td>
      </tr>
      <tr>
        <td class="detail-label">Address</td>
        <td class="detail-value">${escapeHtml(order.address)}</td>
      </tr>
      <tr>
        <td class="detail-label">City</td>
        <td class="detail-value">${escapeHtml(order.city)}</td>
      </tr>
      <tr>
        <td class="detail-label">State</td>
        <td class="detail-value">${escapeHtml(order.state)}</td>
      </tr>
    </table>
  `;
}

function renderPaymentStatus(order: NewOrderEmailData): string {
  return `
    <p>
      <span class="payment-status">
        ${escapeHtml(formatLabel(order.paymentStatus))}
      </span>
    </p>
  `;
}

function buildAdminHtml(order: NewOrderEmailData): string {
  const notes = order.notes?.trim();

  const adminUrl = process.env.ADMIN_DASHBOARD_URL?.trim();

  return renderEmailShell(`
    <p class="eyebrow">New order received</p>
    <h1>A new order is waiting for you.</h1>
    <p class="intro">
      A customer has placed an order with Tricea NG.
      Review the details below and prepare the next steps.
    </p>

    <div class="order-banner">
      <span class="order-label">Order reference</span>
      <span class="order-number">${escapeHtml(order.orderNumber)}</span>
    </div>

    <div class="section">
      <div class="section-heading">
        <h2>Customer & delivery details</h2>
      </div>
      ${renderCustomerDetails(order)}
    </div>

    <div class="section">
      <div class="section-heading">
        <h2>Order items</h2>
      </div>
      ${renderOrderItems(order.items)}
    </div>

    <div class="section">
      <div class="section-heading">
        <h2>Order summary</h2>
      </div>
      ${renderOrderSummary(order)}
    </div>

    <div class="section">
      <div class="section-heading">
        <h2>Payment information</h2>
      </div>
      <p>
        <strong>Method:</strong> Bank Transfer<br />
        <strong>Status:</strong>
        ${escapeHtml(formatLabel(order.paymentStatus))}
      </p>
    </div>

    ${
      notes
        ? `
          <div class="section">
            <div class="section-heading">
              <h2>Customer notes</h2>
            </div>
            <p>${escapeHtml(notes).replace(/\n/g, "<br />")}</p>
          </div>
        `
        : ""
    }

    ${
      adminUrl
        ? `
          <div style="text-align:center;margin-top:24px">
            <a
              class="admin-button"
              href="${escapeHtml(adminUrl)}"
            >
              VIEW ORDER IN ADMIN
            </a>
          </div>
        `
        : `
          <div class="notice">
            Please sign in to the Tricea NG admin dashboard to review
            and manage this order.
          </div>
        `
    }
  `);
}

function buildCustomerHtml(
  order: NewOrderEmailData & {
    paymentBankName: string;
    paymentAccountName: string;
    paymentAccountNumber: string;
  }
): string {
  return renderEmailShell(`
    <p class="eyebrow">Order confirmation</p>
    <h1>Thank you for your order, ${escapeHtml(order.fullName)}.</h1>
    <p class="intro">
      We're delighted you've chosen Tricea NG.
      Your order has been received successfully.
    </p>

<div class="order-banner">
  <span class="order-label">Your order reference</span>
  <span class="order-number">${escapeHtml(order.orderNumber)}</span>
</div>

${
  order.trackingToken
    ? `
      <div class="notice">
        <strong>Track your order</strong>
        <p>
          Keep these details safe. You will need both your order reference
          and tracking token to check your order status.
        </p>
        <p>
          <strong>Order reference:</strong>
          ${escapeHtml(order.orderNumber)}
          <br />
          <strong>Tracking token:</strong>
          ${escapeHtml(order.trackingToken)}
        </p>
        <p>
          Visit <a href="https://triceang.com/track-order">Tricea NG order tracking</a>
          and enter both details.
        </p>
      </div>
    `
    : ""
}

    <div class="section">
      <div class="section-heading">
        <h2>Your order</h2>
      </div>
      ${renderOrderItems(order.items)}
      ${renderOrderSummary(order)}
    </div>

    <div class="section">
      <div class="section-heading">
        <h2>Delivery details</h2>
      </div>
      ${renderCustomerDetails(order)}
    </div>

    <div class="section">
      <div class="section-heading">
        <h2>Payment information</h2>
      </div>
      <p>
        <strong>Payment method:</strong> Bank Transfer<br />
        <strong>Payment status:</strong>
        ${escapeHtml(formatLabel(order.paymentStatus))}
      </p>

      <div class="payment-card">
        <p class="eyebrow">Bank transfer details</p>
        <table role="presentation">
          <tr>
            <td class="detail-label">Bank</td>
            <td>${escapeHtml(order.paymentBankName)}</td>
          </tr>
          <tr>
            <td class="detail-label">Account name</td>
            <td>${escapeHtml(order.paymentAccountName)}</td>
          </tr>
          <tr>
            <td class="detail-label">Account number</td>
            <td><strong>${escapeHtml(order.paymentAccountNumber)}</strong></td>
          </tr>
        </table>
      </div>

      <div class="notice">
        Please use your order number as your payment reference where
        applicable. Your order will be processed once your payment
        has been confirmed.
      </div>
    </div>

    <p style="margin-top:28px">
      Thank you for choosing Tricea NG. We appreciate your order
      and look forward to serving you.
    </p>
  `);
}

function buildAdminText(order: NewOrderEmailData): string {
  const itemLines = order.items
    .map((item) =>
      [
        `${item.productName} | Colour: ${item.colour} | Size: ${item.size}`,
        `SKU: ${item.sku} | Qty: ${item.quantity} | ${formatMoney(item.unitPrice)} each | Total: ${formatMoney(item.total)}`,
        item.customSpecifications?.trim()
          ? `Customisation: ${item.customSpecifications.trim()}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n\n");

  return [
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
    `Subtotal: ${formatMoney(order.subtotal)}`,
    `Total: ${formatMoney(order.total)}`,
    "",
    "PAYMENT",
    "Method: Bank Transfer",
    `Status: ${order.paymentStatus}`,
    "",
    order.notes ? `CUSTOMER NOTES:\n${order.notes}` : "",
    "",
    "Please check the Tricea NG admin dashboard for the full order details.",
  ].join("\n");
}

function buildCustomerText(
  order: NewOrderEmailData & {
    paymentBankName: string;
    paymentAccountName: string;
    paymentAccountNumber: string;
  }
): string {
  const itemLines = order.items
    .map((item) =>
      [
        `${item.productName} | Colour: ${item.colour} | Size: ${item.size}`,
        `SKU: ${item.sku} | Qty: ${item.quantity} | ${formatMoney(item.unitPrice)} each | Total: ${formatMoney(item.total)}`,
        item.customSpecifications?.trim()
          ? `Customisation: ${item.customSpecifications.trim()}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n\n");

  return [
    `Hello ${order.fullName},`,
    "",
    "Thank you for shopping with Tricea NG.",
    "Your order has been received successfully.",
    "",
"ORDER DETAILS",
`Order Number: ${order.orderNumber}`,
"",
...(order.trackingToken
  ? [
      "TRACK YOUR ORDER",
      "Keep these details safe. You will need both to check your order status.",
      `Order reference: ${order.orderNumber}`,
      `Tracking token: ${order.trackingToken}`,
      "Visit https://triceang.com/track-order to track your order.",
      "",
    ]
  : []),
"ITEMS",
    itemLines,
    "",
    "ORDER SUMMARY",
    `Subtotal: ${formatMoney(order.subtotal)}`,
    `Total: ${formatMoney(order.total)}`,
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
  ].join("\n");
}

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

  const { error } = await resend.emails.send({
    from: "Tricea NG <support@triceang.com>",
    to: supportEmail,
    replyTo: order.email,
    subject: `New Order: ${order.orderNumber}`,
    html: buildAdminHtml(order),
    text: buildAdminText(order),
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

  const { error } = await resend.emails.send({
    from: "Tricea NG <support@triceang.com>",
    to: order.email,
    subject: `Order Confirmed: ${order.orderNumber}`,
    html: buildCustomerHtml(order),
    text: buildCustomerText(order),
  });

  if (error) {
    throw new Error(error.message);
  }
}

type CustomRequestEmailData = {
  reference: string;
  fullName: string;
  email: string;
  phone: string;
  productName: string;
  preferredSize: string;
  preferredColour: string;
  customSpecifications: string | null;
  createdAt: Date;
};

function buildCustomRequestDetails(
  request: CustomRequestEmailData
): string {
  const specifications = request.customSpecifications?.trim();

  return `
    <div class="order-banner">
      <span class="order-label">Request reference</span>
      <span class="order-number">
        ${escapeHtml(request.reference)}
      </span>
    </div>

    <div class="section">
      <div class="section-heading">
        <h2>Customer details</h2>
      </div>

      <table role="presentation" class="detail-table" width="100%">
        <tr>
          <td class="detail-label">Full name</td>
          <td class="detail-value">
            ${escapeHtml(request.fullName)}
          </td>
        </tr>

        <tr>
          <td class="detail-label">Email</td>
          <td class="detail-value">
            ${escapeHtml(request.email)}
          </td>
        </tr>

        <tr>
          <td class="detail-label">Phone</td>
          <td class="detail-value">
            ${escapeHtml(request.phone)}
          </td>
        </tr>
      </table>
    </div>

    <div class="section">
      <div class="section-heading">
        <h2>Footwear specifications</h2>
      </div>

      <table role="presentation" class="detail-table" width="100%">
        <tr>
          <td class="detail-label">Product</td>
          <td class="detail-value">
            ${escapeHtml(request.productName)}
          </td>
        </tr>

        <tr>
          <td class="detail-label">Preferred size</td>
          <td class="detail-value">
            ${escapeHtml(request.preferredSize)}
          </td>
        </tr>

        <tr>
          <td class="detail-label">Preferred colour</td>
          <td class="detail-value">
            ${escapeHtml(request.preferredColour)}
          </td>
        </tr>
      </table>

      ${
        specifications
          ? `
            <div class="notice">
              <strong>Customisation instructions</strong>
              <p>
                ${escapeHtml(specifications).replace(/\n/g, "<br />")}
              </p>
            </div>
          `
          : ""
      }
    </div>
  `;
}

function buildAdminCustomRequestHtml(
  request: CustomRequestEmailData
): string {
  const adminUrl = process.env.ADMIN_DASHBOARD_URL?.trim();

  return renderEmailShell(`
    <p class="eyebrow">New custom footwear request</p>

    <h1>A customer wants something distinctive.</h1>

    <p class="intro">
      A new custom footwear request has been submitted.
      Review the customer's specifications and follow up with them.
    </p>

    ${buildCustomRequestDetails(request)}

    <div class="notice">
      <strong>Next step:</strong>
      Review the request, determine whether the specifications
      can be fulfilled, and contact the customer regarding pricing
      and availability.
    </div>

    ${
  adminUrl
    ? `
      <table
        role="presentation"
        border="0"
        cellpadding="0"
        cellspacing="0"
        width="100%"
        style="margin-top:24px"
      >
        <tr>
          <td align="center">
            <table
              role="presentation"
              border="0"
              cellpadding="0"
              cellspacing="0"
            >
              <tr>
                <td
                  align="center"
                  bgcolor="#5a1826"
                  style="
                    background-color:#5a1826;
                    padding:14px 22px;
                  "
                >
                  <a
                    href="${escapeHtml(adminUrl)}"
                    target="_blank"
                    style="
                      display:inline-block;
                      color:#ffffff;
                      font-family:Arial,Helvetica,sans-serif;
                      font-size:12px;
                      font-weight:bold;
                      letter-spacing:1px;
                      line-height:18px;
                      text-decoration:none;
                    "
                  >
                    OPEN ADMIN DASHBOARD
                  </a>
                </td>
              </tr>
            </table>

            <p
              style="
                margin:16px 0 0;
                color:#756c6e;
                font-size:12px;
                line-height:1.6;
                text-align:center;
              "
            >
              If the button doesn't work, use this link:
              <br />
              <a
                href="${escapeHtml(adminUrl)}"
                target="_blank"
                style="
                  color:#731f32;
                  text-decoration:underline;
                  overflow-wrap:anywhere;
                "
              >
                Open the Tricea NG admin dashboard
              </a>
            </p>
          </td>
        </tr>
      </table>
    `
    : ""
}
  `);
}

function buildCustomerCustomRequestHtml(
  request: CustomRequestEmailData
): string {
  return renderEmailShell(`
    <p class="eyebrow">Custom footwear request received</p>

    <h1>Thank you, ${escapeHtml(request.fullName)}.</h1>

    <p class="intro">
      We've received your custom footwear request.
      Our team will review your specifications and get back to you
      regarding availability and pricing.
    </p>

    ${buildCustomRequestDetails(request)}

    <div class="notice">
      <strong>Please note:</strong>
      This is a request, not a confirmed order. No payment is due
      at this stage. We'll contact you once we've reviewed your
      requirements.
    </div>

    <p style="margin-top:28px">
      Keep your request reference for future enquiries.
      Thank you for choosing Tricea NG.
    </p>
  `);
}

function buildCustomRequestText(
  request: CustomRequestEmailData,
  isAdmin: boolean
): string {
  return [
    isAdmin
      ? "TRICEA NG — NEW CUSTOM FOOTWEAR REQUEST"
      : `Hello ${request.fullName},`,
    "",
    isAdmin
      ? "A customer has submitted a custom footwear request."
      : "Thank you for choosing Tricea NG.",
    isAdmin
      ? ""
      : "We've received your custom footwear request.",
    "",
    `Reference: ${request.reference}`,
    `Customer: ${request.fullName}`,
    `Email: ${request.email}`,
    `Phone: ${request.phone}`,
    "",
    "FOOTWEAR SPECIFICATIONS",
    `Product: ${request.productName}`,
    `Preferred size: ${request.preferredSize}`,
    `Preferred colour: ${request.preferredColour}`,
    "",
    "CUSTOMISATION INSTRUCTIONS",
    request.customSpecifications?.trim() || "None provided.",
    "",
    isAdmin
      ? "Please review the request and follow up with the customer."
      : "Your request is not yet a confirmed order.",
    isAdmin
      ? "Please use the admin dashboard to manage the request."
      : "Our team will contact you regarding availability and pricing.",
    "",
    "— Tricea NG",
  ].join("\n");
}

export async function sendNewCustomRequestEmail(
  request: CustomRequestEmailData
) {
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

  const { error } = await resend.emails.send({
    from: "Tricea NG <support@triceang.com>",
    to: supportEmail,
    replyTo: request.email,
    subject: `New Custom Request: ${request.reference}`,
    html: buildAdminCustomRequestHtml(request),
    text: buildCustomRequestText(request, true),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendCustomRequestConfirmationEmail(
  request: CustomRequestEmailData
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const { error } = await resend.emails.send({
    from: "Tricea NG <support@triceang.com>",
    to: request.email,
    subject: `Custom Footwear Request Received: ${request.reference}`,
    html: buildCustomerCustomRequestHtml(request),
    text: buildCustomRequestText(request, false),
  });

  if (error) {
    throw new Error(error.message);
  }
}