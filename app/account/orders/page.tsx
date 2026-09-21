import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function AccountOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const orders = await prisma.order.findMany({
    where: {
      profileId: user.id,
    },
    include: {
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
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="account-dashboard">
      <div className="account-dashboard-inner">
        <div className="account-dashboard-header">
          <div>
            <p className="section-eyebrow">
              MY ACCOUNT
            </p>

            <h1>My Orders.</h1>

            <p>
              View your Tricea orders and keep track
              of their progress.
            </p>
          </div>

          <Link
            href="/account"
            className="account-back-link"
          >
            ← Back to Account
          </Link>
        </div>

        <section className="account-orders-section">
          <div className="account-orders-heading">
            <div>
              <p className="section-eyebrow">
                ORDER HISTORY
              </p>

              <h2>
                {orders.length}{" "}
                {orders.length === 1
                  ? "Order"
                  : "Orders"}
              </h2>
            </div>
          </div>

          {orders.length > 0 ? (
            <div className="account-orders-list">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="account-order-card"
                >
                  <div className="account-order-main">
                    <span className="section-eyebrow">
                      {order.orderNumber}
                    </span>

                    <h3>
                      {order._count.items}{" "}
                      {order._count.items === 1
                        ? "Item"
                        : "Items"}
                    </h3>

                    <p>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div className="account-order-meta">
                    <strong>
                      ₦{order.total.toLocaleString("en-NG")}
                    </strong>

                    <span
                      className={`account-order-status account-order-status-${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>

                    <span className="account-order-view">
                      View Order →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="account-empty-state">
              <p className="section-eyebrow">
                NO ORDERS YET
              </p>

              <h2>
                Your Tricea journey starts here.
              </h2>

              <p>
                You haven't placed an order yet.
                Explore our collection and find
                something worth knowing.
              </p>

              <Link
                href="/shop"
                className="account-shop-button"
              >
                Explore the Collection →
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}