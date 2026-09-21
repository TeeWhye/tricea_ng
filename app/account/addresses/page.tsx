import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function AccountAddressesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const addresses = await prisma.address.findMany({
    where: {
      profileId: user.id,
    },
    orderBy: [
      {
        isDefault: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return (
    <main className="account-dashboard">
      <div className="account-dashboard-inner">
        <div className="account-dashboard-header">
          <div>
            <p className="section-eyebrow">MY ACCOUNT</p>

            <h1>My Addresses.</h1>

            <p>
              Manage your saved delivery addresses for
              faster checkout.
            </p>
          </div>

          <Link
            href="/account"
            className="account-back-link"
          >
            ← Back to Account
          </Link>
        </div>

        <section className="account-addresses-section">
          <div className="account-addresses-heading">
            <div>
              <p className="section-eyebrow">
                SAVED ADDRESSES
              </p>

              <h2>
                {addresses.length}{" "}
                {addresses.length === 1
                  ? "Address"
                  : "Addresses"}
              </h2>
            </div>

            <Link
              href="/account/addresses/new"
              className="account-address-add-button"
            >
              + Add Address
            </Link>
          </div>

          {addresses.length > 0 ? (
            <div className="account-addresses-grid">
              {addresses.map((address) => (
                <article
                  key={address.id}
                  className="account-address-card"
                >
                  <div className="account-address-card-header">
                    <div>
                      <p className="section-eyebrow">
                        {address.label || "ADDRESS"}
                      </p>

                      {address.isDefault && (
                        <span className="account-address-default">
                          Default
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/account/addresses/${address.id}`}
                      className="account-address-edit"
                    >
                      Edit
                    </Link>
                  </div>

                  <div className="account-address-card-body">
                    <strong>{address.address}</strong>

                    <p>{address.city}</p>

                    <p>{address.state}</p>

                    {address.phone && (
                      <p>{address.phone}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="account-empty-state">
              <p className="section-eyebrow">
                NO SAVED ADDRESSES
              </p>

              <h2>Make checkout easier.</h2>

              <p>
                Save your delivery address and you
                won't have to enter it again the next
                time you shop with Tricea.
              </p>

              <Link
                href="/account/addresses/new"
                className="account-shop-button"
              >
                Add Your First Address →
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}