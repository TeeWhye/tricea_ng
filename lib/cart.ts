export type CartProduct = {
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

export type CartItem = {
  product: CartProduct;
  variantId: string;
  size: string;
  colour: string;
  quantity: number;
  customSpecifications?: string;
};

/**
 * Adds a product to the cart while preserving the customer's
 * selected colour and customisation instructions.
 */
export function addToCart(
  items: CartItem[],
  product: CartProduct,
  variantId: string,
  selectedColour?: string,
  customSpecifications?: string
): CartItem[] {
  const variant = product.variants.find(
    (item) => item.id === variantId
  );

  if (!variant || variant.stock <= 0) {
    return items;
  }

  const requestedColour = selectedColour?.trim() || variant.colour;
  const requestedSpecifications = customSpecifications?.trim() || "";

  // Only merge cart items when their variant, selected colour,
  // and customisation instructions are identical.
  const existingItem = items.find(
    (item) =>
      item.variantId === variantId &&
      (item.colour || variant.colour) === requestedColour &&
      (item.customSpecifications?.trim() || "") ===
        requestedSpecifications
  );

  if (existingItem) {
    // Count all quantities for this variant to avoid exceeding stock,
    // including lines with different customisation requests.
    const totalVariantQuantity = items
      .filter((item) => item.variantId === variantId)
      .reduce((total, item) => total + item.quantity, 0);

    if (totalVariantQuantity >= variant.stock) {
      return items;
    }

    return items.map((item) =>
      item === existingItem
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );
  }

  // Do not allow separate customised lines to exceed available stock.
  const totalVariantQuantity = items
    .filter((item) => item.variantId === variantId)
    .reduce((total, item) => total + item.quantity, 0);

  if (totalVariantQuantity >= variant.stock) {
    return items;
  }

  return [
    ...items,
    {
      product,
      variantId,
      size: variant.size,
      colour: requestedColour,
      quantity: 1,
      customSpecifications: requestedSpecifications,
    },
  ];
}