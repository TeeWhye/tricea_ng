"use client";

import type { CartItem as CartItemType } from "@/lib/cart";

type CartItemProps = {
  item: CartItemType;
  onUpdateQuantity: (
    variantId: string,
    quantity: number
  ) => void;
};

export default function CartItem({
  item,
  onUpdateQuantity,
}: CartItemProps) {
  const variant = item.product.variants.find(
  (itemVariant) => itemVariant.id === item.variantId
);

const unitPrice = variant?.price ?? item.product.price;
const itemTotal = unitPrice * item.quantity;
  const image = item.product.images[0];

  return (
    <article className="cart-item">
      <div className="cart-item-image">
        {image ? (
          <img
            src={image.url}
            alt={image.altText ?? item.product.name}
          />
        ) : (
          <div className="product-image-placeholder">
            Tricea NG
          </div>
        )}
      </div>

      <div className="cart-item-details">
        <p>{item.product.category.name}</p>
        <h2>{item.product.name}</h2>
        <span>Colour {item.colour}</span>
<span>Size {item.size}</span>

        <strong>
          ₦{itemTotal.toLocaleString("en-NG")}
        </strong>
      </div>

      <div className="cart-item-controls">
        <button
          type="button"
          onClick={() =>
            onUpdateQuantity(
              item.variantId,
              item.quantity - 1
            )
          }
          aria-label={`Decrease quantity of ${item.product.name}`}
        >
          −
        </button>

        <span>{item.quantity}</span>

        <button
          type="button"
          onClick={() =>
            onUpdateQuantity(
              item.variantId,
              item.quantity + 1
            )
          }
          aria-label={`Increase quantity of ${item.product.name}`}
        >
          +
        </button>
      </div>
    </article>
  );
}