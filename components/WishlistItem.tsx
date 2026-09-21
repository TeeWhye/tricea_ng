"use client";

import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useState } from "react";

type WishlistItemProps = {
  item: {
    id: string;
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
};

type WishlistItemState = "saved" | "removing" | "removed";

export default function WishlistItem({
  item,
}: WishlistItemProps) {
  const [status, setStatus] =
    useState<WishlistItemState>("saved");

  const product = item.product;
  const image = product.images[0];

  async function handleRemove() {
    setStatus("removing");

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

      if (!response.ok) {
        setStatus("saved");
        return;
      }

      setStatus("removed");
window.dispatchEvent(new Event("wishlist-updated"));
    } catch {
      setStatus("saved");
    }
  }

  if (status === "removed") {
    return null;
  }

  return (
    <article className="account-wishlist-card">
      <div className="account-wishlist-image-wrapper">
        <Link
          href={`/products/${product.id}`}
          className="account-wishlist-image"
        >
          {image ? (
            <img
              src={image.url}
              alt={image.altText ?? product.name}
            />
          ) : (
            <span>Tricea NG</span>
          )}
        </Link>

        <button
          type="button"
          className="account-wishlist-remove"
          onClick={handleRemove}
          disabled={status === "removing"}
          aria-label={`Remove ${product.name} from wishlist`}
        >
          {status === "removing" ? (
            <span className="wishlist-remove-loading">
              ...
            </span>
          ) : (
            <X size={17} strokeWidth={1.5} />
          )}
        </button>
      </div>

      <div className="account-wishlist-info">
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