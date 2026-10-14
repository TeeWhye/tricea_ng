"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CartItem as CartItemType } from "@/lib/cart";
import CartItem from "@/components/CartItem";

function getCartItemKey(item: CartItemType) {
  return JSON.stringify([
    item.variantId,
    item.colour || "",
    item.customSpecifications?.trim() || "",
  ]);
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItemType[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("tricea-cart");

    if (storedCart) {
      try {
        const parsedCart: CartItemType[] = JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      } catch {
        setCart([]);
      }
    }
  }, []);

  function updateQuantity(
    cartItemKey: string,
    quantity: number
  ) {
    const cartItem = cart.find(
      (item) => getCartItemKey(item) === cartItemKey
    );

    if (!cartItem) {
      return;
    }

    const variant = cartItem.product.variants.find(
      (item) => item.id === cartItem.variantId
    );

    if (!variant) {
      return;
    }

    // Do not allow the quantity of this variant to exceed its stock.
    const quantityOfOtherLines = cart
      .filter(
        (item) =>
          item.variantId === cartItem.variantId &&
          getCartItemKey(item) !== cartItemKey
      )
      .reduce((total, item) => total + item.quantity, 0);

    if (quantity + quantityOfOtherLines > variant.stock) {
      return;
    }

    const updatedCart = cart
      .map((item) =>
        getCartItemKey(item) === cartItemKey
          ? { ...item, quantity }
          : item
      )
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);

    localStorage.setItem(
      "tricea-cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(new Event("cart-updated"));
  }

  const subtotal = cart.reduce((total, item) => {
    const variant = item.product.variants.find(
      (itemVariant) => itemVariant.id === item.variantId
    );

    const unitPrice = variant?.price ?? item.product.price;

    return total + unitPrice * item.quantity;
  }, 0);

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

          <Link href="/shop" className="cart-shop-button">
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
                key={getCartItemKey(item)}
                item={item}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Subtotal</span>

              <strong>
                ₦{subtotal.toLocaleString("en-NG")}
              </strong>
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-total">
              <span>Total</span>

              <strong>
                ₦{subtotal.toLocaleString("en-NG")}
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