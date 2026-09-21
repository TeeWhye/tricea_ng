import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOrdersPage() {
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

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      orderNumber: true,
      fullName: true,
      email: true,
      total: true,
      status: true,
      createdAt: true,
      payment: {
        select: {
          status: true,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  return (
    <main className="admin-page">
      <div className="admin-page-inner">
        <header className="admin-header admin-orders-header">
          <div>
            <Link
              href="/admin"
              className="admin-back-link"
            >
              ← Dashboard
            </Link>

            <p className="section-eyebrow">
              TRICEA NG · STORE ACTIVITY
            </p>

            <h1>
              Customer
              <br />
              Orders.
            </h1>

            <p className="admin-header-description">
              Review and manage orders placed through the
              store.
            </p>
          </div>
        </header>

        <section className="admin-orders-page-section">
          <div className="admin-section-heading">
            <div>
              <p className="section-eyebrow">
                ORDER HISTORY
              </p>

              <h2>
                {orders.length}{" "}
                {orders.length === 1 ? "Order" : "Orders"}
              </h2>
            </div>
          </div>

          {orders.length > 0 ? (
            <div className="admin-orders-table-wrapper">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="admin-order-number"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>

                      <td>
                        <div className="admin-customer-cell">
                          <strong>
                            {order.fullName}
                          </strong>
                          <span>{order.email}</span>
                        </div>
                      </td>

                      <td>
                        {order._count.items}
                      </td>

                      <td>
                        ₦{order.total.toLocaleString("en-NG")}
                      </td>

                      <td>
                        <span
                          className={`admin-status admin-status-${order.status.toLowerCase()}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-status admin-payment-${order.payment?.status.toLowerCase() ?? "pending"}`}
                        >
                          {order.payment?.status ?? "PENDING"}
                        </span>
                      </td>

                      <td>
                        {new Intl.DateTimeFormat("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }).format(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-orders-empty">
              <h3>No orders yet.</h3>

              <p>
                Orders placed through the store will appear
                here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}