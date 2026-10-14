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
  selectedColour: string;
};

export default function AddToBagButton({
  product,
  selectedVariantId,
  selectedColour,
}: AddToBagButtonProps) {
  const [added, setAdded] = useState(false);

  function handleAddToBag() {
    if (!selectedColour) {
      alert("Please select your preferred colour.");
      return;
    }

    if (!selectedVariantId) {
      alert(
        "Please select an available size. For a different size, use Request Custom Footwear."
      );
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

    let currentCart: CartItem[] = [];

    try {
      currentCart = storedCart ? JSON.parse(storedCart) : [];

      if (!Array.isArray(currentCart)) {
        currentCart = [];
      }
    } catch {
      alert("We couldn't load your shopping cart. Please try again.");
      return;
    }

    const updatedCart = addToCart(
      currentCart,
      product,
      selectedVariant.id,
      selectedColour,
      ""
    );

    const previousQuantity = currentCart.reduce(
      (total, item) =>
        item.variantId === selectedVariant.id
          ? total + item.quantity
          : total,
      0
    );

    const updatedQuantity = updatedCart.reduce(
      (total, item) =>
        item.variantId === selectedVariant.id
          ? total + item.quantity
          : total,
      0
    );

    if (updatedQuantity === previousQuantity) {
      alert(
        "This size has reached its available stock limit and cannot be added again."
      );
      return;
    }

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
      className={`product-add-button ${added ? "added" : ""}`}
      onClick={handleAddToBag}
    >
      {added ? "Added to Bag ✓" : "Add to Bag"}
    </button>
  );
}