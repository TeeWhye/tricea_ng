import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function Footer() {
  const [storeNameSetting, categories] = await Promise.all([
    prisma.storeSetting.findUnique({
      where: {
        key: "store_name",
      },
      select: {
        value: true,
      },
    }),

    prisma.category.findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  const storeName = storeNameSetting?.value || "Tricea NG";

  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <Link
            href="/"
            className="site-footer-logo"
          >
            Tricea <span>NG</span>
          </Link>

          <p>
            Thoughtfully crafted footwear,
            <br />
            rooted in African culture.
          </p>
        </div>

        <div className="site-footer-column">
          <h3>SHOP</h3>

          <Link href="/shop">
            All Footwear
          </Link>

          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="site-footer-column">
          <h3>TRICEA</h3>

          <Link href="/about">
            Our Story
          </Link>

          <Link href="/contact">
            Contact
          </Link>

          <Link href="/size-guide">
            Size Guide
          </Link>

          <Link href="/shipping">
            Shipping & Delivery
          </Link>

          <Link href="/returns">
            Returns
          </Link>
        </div>

        <div className="site-footer-column">
          <h3>ACCOUNT</h3>

          <Link href="/account">
            My Account
          </Link>

          <Link href="/account/orders">
            Orders
          </Link>

          <Link href="/account/wishlist">
            Wishlist
          </Link>
        </div>
      </div>

      <div className="site-footer-bottom">
        <p>
          © {new Date().getFullYear()} {storeName}.
          All rights reserved.
        </p>

        <div>
          <Link href="/privacy">
            Privacy
          </Link>

          <Link href="/terms">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}