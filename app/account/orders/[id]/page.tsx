import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const order = await prisma.order.findFirst({
    where: {
      id,
      profileId: user.id,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: {
                  isPrimary: true,
                },
                take: 1,
              },
            },
          },
        },
      },
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="account-dashboard">
      <div className="account-dashboard-inner">
        <div className="account-dashboard-header">
          <div>
            <p className="section-eyebrow">ORDER DETAILS</p>

            <h1>{order.orderNumber}</h1>

            <p>
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString(
                "en-NG",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </p>
          </div>

          <Link
            href="/account/orders"
            className="account-back-link"
          >
            ← Back to Orders
          </Link>
        </div>

        <section className="account-order-detail">
          <div className="account-order-detail-header">
            <div>
              <p className="section-eyebrow">ORDER STATUS</p>

              <span
                className={`account-order-status account-order-status-${order.status.toLowerCase()}`}
              >
                {order.status}
              </span>
            </div>

            <div className="account-order-payment-status">
              <p className="section-eyebrow">PAYMENT</p>

              <span>
                {order.payment?.status ?? "PENDING"}
              </span>
            </div>
          </div>

          <div className="account-order-items">
            <div className="account-order-section-heading">
              <p className="section-eyebrow">YOUR ITEMS</p>
              <h2>
                {order.items.length}{" "}
                {order.items.length === 1 ? "Item" : "Items"}
              </h2>
            </div>

            <div className="account-order-item-list">
              {order.items.map((item) => {
                const image = item.product.images[0];

                return (
                  <div
                    key={item.id}
                    className="account-order-item"
                  >
                    <div className="account-order-item-image">
                      {image ? (
                        <img
                          src={image.url}
                          alt={
                            image.altText ??
                            item.productName
                          }
                        />
                      ) : (
                        <span>Tricea NG</span>
                      )}
                    </div>

                    <div className="account-order-item-info">
                      <h3>{item.productName}</h3>

                      <p>
                        Size {item.size} · {item.colour}
                      </p>

                      <p>
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <div className="account-order-item-price">
                      ₦{item.total.toLocaleString("en-NG")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="account-order-summary">
            <div className="account-order-summary-row">
              <span>Subtotal</span>
              <strong>
                ₦{order.subtotal.toLocaleString("en-NG")}
              </strong>
            </div>

            <div className="account-order-summary-row">
              <span>Delivery</span>
              <strong>
                ₦{order.deliveryFee.toLocaleString("en-NG")}
              </strong>
            </div>

            <div className="account-order-summary-total">
              <span>Total</span>
              <strong>
                ₦{order.total.toLocaleString("en-NG")}
              </strong>
            </div>
          </div>

          <div className="account-order-information">
            <div>
              <p className="section-eyebrow">
                DELIVERY ADDRESS
              </p>

              <p>{order.fullName}</p>
              <p>{order.address}</p>
              <p>
                {order.city}, {order.state}
              </p>
              <p>{order.phone}</p>
            </div>

            <div>
              <p className="section-eyebrow">
                CONTACT
              </p>

              <p>{order.email}</p>

              {order.notes && (
                <>
                  <p className="section-eyebrow account-order-notes-heading">
                    ORDER NOTES
                  </p>
                  <p>{order.notes}</p>
                </>
              )}
            </div>
          </div>

          {order.payment?.method === "BANK_TRANSFER" &&
  order.payment.status === "PENDING" && (
    <div className="account-order-payment-notice">
      <p className="section-eyebrow">
        PAYMENT REQUIRED
      </p>

      <h2>Complete your bank transfer.</h2>

      <p>
        Your order is currently awaiting payment
        confirmation. Please transfer the exact order
        total using the account details below.
      </p>

      <div className="account-order-bank-details">
        <div>
          <span>Bank Name</span>
          <strong>
            {order.paymentBankName || "Not provided"}
          </strong>
        </div>

        <div>
          <span>Account Name</span>
          <strong>
            {order.paymentAccountName || "Not provided"}
          </strong>
        </div>

        <div>
          <span>Account Number</span>
          <strong>
            {order.paymentAccountNumber || "Not provided"}
          </strong>
        </div>

        <div>
          <span>Amount to Transfer</span>
          <strong>
            ₦{order.total.toLocaleString("en-NG")}
          </strong>
        </div>
      </div>
    </div>
  )}
        </section>
      </div>
    </main>
  );
}