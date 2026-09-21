"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CartItem as CartItemType } from "@/lib/cart";
import CartItem from "@/components/CartItem";

export default function CartPage() {
  const [cart, setCart] = useState<CartItemType[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("tricea-cart");

    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  function updateQuantity(
  variantId: string,
  quantity: number
) {
  const cartItem = cart.find(
    (item) => item.variantId === variantId
  );

  if (!cartItem) {
    return;
  }

  const variant = cartItem.product.variants.find(
    (item) => item.id === variantId
  );

  if (!variant) {
    return;
  }

  if (quantity > variant.stock) {
    return;
  }

  const updatedCart = cart
    .map((item) =>
      item.variantId === variantId
        ? { ...item, quantity }
        : item
    )
    .filter((item) => item.quantity > 0);

  setCart(updatedCart);
localStorage.setItem("tricea-cart", JSON.stringify(updatedCart));

window.dispatchEvent(new Event("cart-updated"));
}

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <p className="section-eyebrow">YOUR BAG</p>

          <h1>Your bag is empty.</h1>

          <p>
            Discover something worth wearing from the
            Tricea collection.
          </p>

          <Link
            href="/shop"
            className="cart-shop-button"
          >
            Explore the Collection <span>→</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-page-inner">
        <div className="cart-heading">
          <p className="section-eyebrow">YOUR BAG</p>

          <h1>
            Your
            <br />
            selection.
          </h1>
        </div>

      <div className="cart-content">
  <div className="cart-items">
    {cart.map((item) => (
      <CartItem
        key={item.variantId}
        item={item}
        onUpdateQuantity={updateQuantity}
      />
    ))}
  </div>

  <div className="cart-summary">
    <div className="cart-summary-row">
      <span>Subtotal</span>

      <strong>
        ₦
       {cart
  .reduce((total, item) => {
    const variant = item.product.variants.find(
      (itemVariant) => itemVariant.id === item.variantId
    );

    const unitPrice =
      variant?.price ?? item.product.price;

    return total + unitPrice * item.quantity;
  }, 0)
  .toLocaleString("en-NG")}
      </strong>
    </div>

    <div className="cart-summary-row">
      <span>Delivery</span>
      <span>Calculated at checkout</span>
    </div>

    <div className="cart-summary-divider" />

    <div className="cart-summary-total">
      <span>Total</span>

      <strong>
        ₦
        {cart
          .reduce(
            (total, item) =>
              total +
              item.product.price * item.quantity,
            0
          )
          .toLocaleString("en-NG")}
      </strong>
    </div>

    <Link
      href="/checkout"
      className="cart-checkout-button"
    >
      Proceed to Checkout <span>→</span>
    </Link>
  </div>
</div>
      </div>
    </main>
  );
}