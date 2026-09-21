import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
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
      fullName: true,
      role: true,
    },
  });

  if (!profile || profile.role !== "ADMIN") {
    redirect("/");
  }

  const [
    totalOrders,
    pendingOrders,
    totalProducts,
    lowStockVariants,
    successfulPayments,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),

    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.product.count({
      where: {
        isActive: true,
      },
    }),

    prisma.productVariant.count({
      where: {
        stock: {
          lte: 2,
        },
      },
    }),

    prisma.payment.findMany({
      where: {
        status: "SUCCESSFUL",
      },
      select: {
        amount: true,
      },
    }),

    prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        fullName: true,
        total: true,
        status: true,
        createdAt: true,
        payment: {
          select: {
            status: true,
          },
        },
      },
    }),
  ]);

  const revenue = successfulPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  return (
    <main className="admin-page">
      <div className="admin-page-inner">
        <header className="admin-header">
          <div>
            <p className="section-eyebrow">
              TRICEA NG · ADMIN
            </p>

            <h1>
              Welcome,
              <br />
              {profile.fullName ?? "Admin"}.
            </h1>

            <p className="admin-header-description">
              Here's what's happening with your store.
            </p>
          </div>
        </header>

        <section className="admin-metrics">
          <article className="admin-metric-card">
            <span>Total Orders</span>
            <strong>{totalOrders}</strong>
          </article>

          <article className="admin-metric-card">
            <span>Pending Orders</span>
            <strong>{pendingOrders}</strong>
          </article>

          <article className="admin-metric-card">
            <span>Revenue</span>
            <strong>
              ₦{revenue.toLocaleString("en-NG")}
            </strong>
          </article>

          <article className="admin-metric-card">
            <span>Products</span>
            <strong>{totalProducts}</strong>
          </article>

          <article className="admin-metric-card admin-metric-warning">
            <span>Low Stock</span>
            <strong>{lowStockVariants}</strong>
          </article>
        </section>

        <section className="admin-orders">
          <div className="admin-section-heading">
            <div>
              <p className="section-eyebrow">
                STORE ACTIVITY
              </p>

              <h2>Recent Orders</h2>
            </div>

            <Link href="/admin/orders">
              View All Orders <span>→</span>
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="admin-orders-table-wrapper">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="admin-order-number"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>

                      <td>{order.fullName}</td>

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