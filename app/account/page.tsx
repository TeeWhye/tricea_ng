import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: user.id,
    },
    select: {
      fullName: true,
      phone: true,
      role: true,
    },
  });

  if (!profile) {
    redirect("/account/login");
  }

  return (
    <main className="account-dashboard">
      <div className="account-dashboard-inner">
        <div className="account-dashboard-header">
          <div>
            <p className="section-eyebrow">
              MY ACCOUNT
            </p>

            <h1>
              Welcome,
              <br />
              {profile.fullName}.
            </h1>

            <p>
              Manage your Tricea account, orders,
              and personal details.
            </p>
          </div>
        </div>

        <div className="account-dashboard-grid">
          {profile.role === "ADMIN" && (
  <Link
    href="/admin"
    className="account-dashboard-card account-admin-card"
  >
    <span className="section-eyebrow">
      ADMIN
    </span>
    <h2>Admin Dashboard</h2>
    <p>
      Manage your Tricea store, products, orders,
      and catalogue.
    </p>
    <span className="account-dashboard-card-link">
      Go to Admin →
    </span>
  </Link>
)}

          <Link
            href="/account/orders"
            className="account-dashboard-card"
          >
            <span className="section-eyebrow">
              ORDERS
            </span>

            <h2>My Orders</h2>

            <p>
              View your orders and track their status.
            </p>

            <span className="account-dashboard-card-link">
              View Orders →
            </span>
          </Link>

          <Link
  href="/account/notifications"
  className="account-dashboard-card"
>
  <span className="section-eyebrow">
    UPDATES
  </span>

  <h2>Notifications</h2>

  <p>
    Stay updated on your orders, payments, and Tricea activity.
  </p>

  <span className="account-dashboard-card-link">
    View Notifications →
  </span>
</Link>

          <Link
            href="/account/wishlist"
            className="account-dashboard-card"
          >
            <span className="section-eyebrow">
              SAVED
            </span>

            <h2>Wishlist</h2>

            <p>
              Keep the pieces you love in one place.
            </p>

            <span className="account-dashboard-card-link">
              View Wishlist →
            </span>
          </Link>

          <Link
            href="/account/details"
            className="account-dashboard-card"
          >
            <span className="section-eyebrow">
              ACCOUNT
            </span>

            <h2>Account Details</h2>

            <p>
              Manage your name, email, and contact
              information.
            </p>

            <span className="account-dashboard-card-link">
              Manage Account →
            </span>
          </Link>

          <Link
            href="/account/addresses"
            className="account-dashboard-card"
          >
            <span className="section-eyebrow">
              DELIVERY
            </span>

            <h2>Addresses</h2>

            <p>
              Manage your saved delivery addresses.
            </p>

            <span className="account-dashboard-card-link">
              Manage Addresses →
            </span>
          </Link>
        </div>

        <div className="account-dashboard-footer">
          <p>
            Signed in as{" "}
            <strong>{user.email}</strong>
          </p>

          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="account-signout-button"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}