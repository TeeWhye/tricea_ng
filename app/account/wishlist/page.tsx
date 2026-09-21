import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import WishlistItem from "@/components/WishlistItem";

export default async function WishlistPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: {
      profileId: user.id,
      product: {
        isActive: true,
      },
    },
    include: {
      product: {
        include: {
          category: true,
          images: {
            where: {
              isPrimary: true,
            },
            take: 1,
          },
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
            <p className="section-eyebrow">MY ACCOUNT</p>

            <h1>Wishlist.</h1>

            <p>
              Keep the pieces you love close until
              you're ready to make them yours.
            </p>
          </div>

          <Link
            href="/account"
            className="account-back-link"
          >
            ← Back to Account
          </Link>
        </div>

        <section className="account-wishlist-section">
          <div className="account-wishlist-heading">
            <div>
              <p className="section-eyebrow">
                SAVED PIECES
              </p>

              <h2>
                {wishlistItems.length}{" "}
                {wishlistItems.length === 1
                  ? "Piece"
                  : "Pieces"}
              </h2>
            </div>
          </div>

          {wishlistItems.length > 0 ? (
            <div className="account-wishlist-grid">
  {wishlistItems.map((item) => (
    <WishlistItem
      key={item.id}
      item={item}
    />
  ))}
</div>
          ) : (
            <div className="account-empty-state">
              <p className="section-eyebrow">
                YOUR WISHLIST IS EMPTY
              </p>

              <h2>
                Nothing saved yet.
              </h2>

              <p>
                When you find a piece you love, tap the
                heart to save it here.
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