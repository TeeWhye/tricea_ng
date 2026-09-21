import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import AdminOrderActions from "@/components/AdminOrderActions";

type AdminOrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminOrderPage({
  params,
}: AdminOrderPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: user.id,
    },
    select: {
      role: true,
    },
  });

  if (!profile || profile.role !== "ADMIN") {
    redirect("/");
  }

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      items: {
        orderBy: {
          id: "asc",
        },
      },
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="admin-page">
      <div className="admin-page-inner">
        <header className="admin-order-detail-header">
          <Link
            href="/admin/orders"
            className="admin-back-link"
          >
            ← All Orders
          </Link>

          <div className="admin-order-detail-heading">
            <div>
              <p className="section-eyebrow">
                TRICEA NG · ORDER
              </p>

              <h1>{order.orderNumber}</h1>

              <p>
                Placed{" "}
                {new Intl.DateTimeFormat("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }).format(order.createdAt)}
              </p>
            </div>

            <span
              className={`admin-status admin-status-${order.status.toLowerCase()}`}
            >
              {order.status}
            </span>
          </div>
        </header>

        <div className="admin-order-detail-grid">
            <AdminOrderActions
  orderId={order.id}
  orderStatus={order.status}
  paymentStatus={order.payment?.status ?? null}
/>
          <section className="admin-order-card">
            <div className="admin-order-card-heading">
              <p className="section-eyebrow">
                ORDER ITEMS
              </p>

              <span>
                {order.items.length}{" "}
                {order.items.length === 1
                  ? "Item"
                  : "Items"}
              </span>
            </div>

            <div className="admin-order-items">
              {order.items.map((item) => (
                <article
                  key={item.id}
                  className="admin-order-item"
                >
                  <div>
                    <h2>{item.productName}</h2>

                    <p>
                      Size {item.size} · {item.colour}
                    </p>

                    <span>
                      SKU: {item.sku}
                    </span>
                  </div>

                  <div className="admin-order-item-price">
                    <span>
                      {item.quantity} × ₦
                      {item.unitPrice.toLocaleString(
                        "en-NG"
                      )}
                    </span>

                    <strong>
                      ₦{item.total.toLocaleString("en-NG")}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-order-card">
            <div className="admin-order-card-heading">
              <p className="section-eyebrow">
                CUSTOMER
              </p>
            </div>

            <div className="admin-customer-details">
              <div>
                <span>Name</span>
                <strong>{order.fullName}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>{order.email}</strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{order.phone}</strong>
              </div>
            </div>
          </section>

          <section className="admin-order-card">
            <div className="admin-order-card-heading">
              <p className="section-eyebrow">
                DELIVERY
              </p>
            </div>

            <div className="admin-customer-details">
              <div>
                <span>Address</span>
                <strong>{order.address}</strong>
              </div>

              <div>
                <span>City</span>
                <strong>{order.city}</strong>
              </div>

              <div>
                <span>State</span>
                <strong>{order.state}</strong>
              </div>

              {order.notes && (
                <div>
                  <span>Customer Notes</span>
                  <strong>{order.notes}</strong>
                </div>
              )}
            </div>
          </section>

          <section className="admin-order-card">
            <div className="admin-order-card-heading">
              <p className="section-eyebrow">
                PAYMENT
              </p>

              <span
                className={`admin-status admin-payment-${order.payment?.status.toLowerCase() ?? "pending"}`}
              >
                {order.payment?.status ?? "PENDING"}
              </span>
            </div>

            <div className="admin-payment-details">
              <div>
                <span>Method</span>
                <strong>
                  {order.payment?.method ===
                  "BANK_TRANSFER"
                    ? "Bank Transfer"
                    : order.payment?.method}
                </strong>
              </div>

              <div>
                <span>Amount</span>
                <strong>
                  ₦{order.total.toLocaleString("en-NG")}
                </strong>
              </div>

              {order.payment?.reference && (
                <div>
                  <span>Reference</span>
                  <strong>
                    {order.payment.reference}
                  </strong>
                </div>
              )}
            </div>
          </section>

          <section className="admin-order-card admin-order-summary">
            <div className="admin-order-card-heading">
              <p className="section-eyebrow">
                ORDER SUMMARY
              </p>
            </div>

            <div className="admin-summary-lines">
              <div>
                <span>Subtotal</span>
                <strong>
                  ₦{order.subtotal.toLocaleString("en-NG")}
                </strong>
              </div>

              <div>
                <span>Delivery</span>
                <strong>
                  ₦
                  {order.deliveryFee.toLocaleString(
                    "en-NG"
                  )}
                </strong>
              </div>

              <div className="admin-summary-total">
                <span>Total</span>
                <strong>
                  ₦{order.total.toLocaleString("en-NG")}
                </strong>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}