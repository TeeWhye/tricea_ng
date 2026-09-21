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
};

export function addToCart(
  items: CartItem[],
  product: CartProduct,
  variantId: string
): CartItem[] {
  const variant = product.variants.find(
    (item) => item.id === variantId
  );

  if (!variant || variant.stock <= 0) {
    return items;
  }

  const existingItem = items.find(
    (item) => item.variantId === variantId
  );

  if (existingItem) {
    if (existingItem.quantity >= variant.stock) {
      return items;
    }

    return items.map((item) =>
      item.variantId === variantId
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );
  }

  return [
    ...items,
    {
  product,
  variantId,
  size: variant.size,
  colour: variant.colour,
  quantity: 1,
}
  ];
}