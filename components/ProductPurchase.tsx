"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import ProductOptions from "@/components/ProductOptions";
import AddToBagButton from "@/components/AddToBagButton";

type ProductPurchaseProps = {
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
    variants: {
      id: string;
      size: string;
      colour: string;
      sku: string;
      stock: number;
      price: number | null;
    }[];
  };
};

export default function ProductPurchase({
  product,
}: ProductPurchaseProps) {
 const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
  null
);

const [wishlisted, setWishlisted] = useState(false);
const [loadingWishlist, setLoadingWishlist] = useState(true);

useEffect(() => {
  async function loadWishlistStatus() {
    try {
      const response = await fetch("/api/account/wishlist");

      if (!response.ok) {
        setLoadingWishlist(false);
        return;
      }

      const data = await response.json();

      if (Array.isArray(data.productIds)) {
        setWishlisted(data.productIds.includes(product.id));
      }
    } catch {
      // Wishlist is optional for browsing.
    } finally {
      setLoadingWishlist(false);
    }
  }

  loadWishlistStatus();
}, [product.id]);

  return (
    <>
      <ProductOptions
  variants={product.variants}
  onVariantChange={(variantId) => {
    setSelectedVariantId(variantId);
  }}
/>

      <div className="product-page-actions">
        <AddToBagButton
  product={product}
  selectedVariantId={selectedVariantId}
/>

       <button
  type="button"
  className={`product-wishlist-button ${
    wishlisted ? "active" : ""
  }`}
  aria-label={
    wishlisted
      ? `Remove ${product.name} from wishlist`
      : `Add ${product.name} to wishlist`
  }
  disabled={loadingWishlist}
  onClick={async () => {
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
          "/account/login?redirect=/products/" +
          product.id;
        return;
      }

      if (!response.ok) {
        return;
      }

      setWishlisted(data.wishlisted);
window.dispatchEvent(new Event("wishlist-updated"));
    } catch {
      // Keep current wishlist state if the request fails.
    }
  }}
>
  <Heart
    size={20}
    strokeWidth={1.5}
    fill={wishlisted ? "currentColor" : "none"}
  />
</button>
      </div>
    </>
  );
}