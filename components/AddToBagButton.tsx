"use client";

import { useState } from "react";
import { addToCart, type CartItem } from "@/lib/cart";

type Product = {
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

type AddToBagButtonProps = {
  product: Product;
  selectedVariantId: string | null;
};

export default function AddToBagButton({
  product,
  selectedVariantId,
}: AddToBagButtonProps) {
  const [added, setAdded] = useState(false);

  function handleAddToBag() {
    if (!selectedVariantId) {
  alert("Please select a size.");
  return;
}

const selectedVariant = product.variants.find(
  (variant) => variant.id === selectedVariantId
);

if (!selectedVariant) {
  alert("This variant is not available.");
  return;
}

    if (selectedVariant.stock <= 0) {
      alert("This size is currently out of stock.");
      return;
    }

    const storedCart = localStorage.getItem("tricea-cart");

    const currentCart: CartItem[] = storedCart
      ? JSON.parse(storedCart)
      : [];

    const updatedCart = addToCart(
  currentCart,
  product,
  selectedVariant.id
);

    localStorage.setItem("tricea-cart", JSON.stringify(updatedCart));

window.dispatchEvent(new Event("cart-updated"));

setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  }

  return (
    <button
      type="button"
      className={`product-add-button ${
  added ? "added" : ""
}`}
      onClick={handleAddToBag}
    >
      {added ? "Added to Bag ✓" : "Add to Bag"}
    </button>
  );
}