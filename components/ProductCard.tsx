"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    price: number;
    category: {
      name: string;
    };
    images: {
      url: string;
      altText: string | null;
    }[];
  };
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [loadingWishlist, setLoadingWishlist] =
    useState(true);

  useEffect(() => {
    async function loadWishlistStatus() {
      try {
        const response = await fetch(
          "/api/account/wishlist"
        );

        if (!response.ok) {
          setLoadingWishlist(false);
          return;
        }

        const data = await response.json();

        setWishlisted(
          data.productIds.includes(product.id)
        );
      } catch {
        // Wishlist is optional for browsing.
      } finally {
        setLoadingWishlist(false);
      }
    }

    loadWishlistStatus();
  }, [product.id]);

  async function handleWishlistClick() {
    if (loadingWishlist) return;

    try {
      const response = await fetch(
        "/api/account/wishlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href =
          "/account/login?redirect=/shop";

        return;
      }

      if (!response.ok) {
        return;
      }

      setWishlisted(data.wishlisted);
window.dispatchEvent(new Event("wishlist-updated"));
    } catch {
      // Keep the current UI state if the request fails.
    }
  }

  const image = product.images[0];

  return (
    <article className="product-card">
      <div className="product-card-image">
        <button
          type="button"
          className={`product-wishlist ${
            wishlisted ? "active" : ""
          }`}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          onClick={handleWishlistClick}
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>

        <Link
          href={`/products/${product.id}`}
          className="product-image-link"
        >
          {image ? (
            <img
              src={image.url}
              alt={image.altText ?? product.name}
              className="product-image"
            />
          ) : (
            <div className="product-image-placeholder">
              Tricea NG
            </div>
          )}
        </Link>
      </div>

      <div className="product-card-info">
        <div>
          <p className="product-category">
            {product.category.name}
          </p>

          <Link href={`/products/${product.id}`}>
            <h3>{product.name}</h3>
          </Link>
        </div>

        <p className="product-price">
          ₦{product.price.toLocaleString("en-NG")}
        </p>
      </div>
    </article>
  );
}