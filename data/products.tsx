export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  badge?: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Black Cross",
    category: "Palm Slippers",
    price: 35000,
    image: "/images/products/classic-palm.jpg",
    badge: "Featured",
  },
  {
    id: 2,
    name: "Green Botanical",
    category: "Palm Slippers",
    price: 45000,
    image: "/images/products/heritage-sandal.jpg",
    badge: "New",
  },
  {
    id: 3,
    name: "Olive Platform",
    category: "Palm Slippers",
    price: 40000,
    image: "/images/products/signature-handmade.jpg",
  },
];