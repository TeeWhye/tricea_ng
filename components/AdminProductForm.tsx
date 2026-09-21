"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type AdminProductFormProps = {
  product: {
    id: string;
    name: string;
    categoryId: string;
    sku: string;
    price: number;
    description: string | null;
    isActive: boolean;
  };
  categories: Category[];
};

export default function AdminProductForm({
  product,
  categories,
}: AdminProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(product.name);
  const [categoryId, setCategoryId] = useState(
    product.categoryId
  );
  const [sku, setSku] = useState(product.sku);
  const [price, setPrice] = useState(
    product.price.toString()
  );
  const [description, setDescription] = useState(
    product.description ?? ""
  );
  const [isActive, setIsActive] = useState(
    product.isActive
  );

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            categoryId,
            sku,
            price: Number(price),
            description,
            isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update product."
        );
      }

      setMessage("Product updated successfully.");

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="admin-order-card admin-product-edit">
      <div className="admin-order-card-heading">
        <p className="section-eyebrow">
          EDIT PRODUCT
        </p>
      </div>

      <form
        className="admin-product-form"
        onSubmit={handleSubmit}
      >
        <label>
          <span>Product Name</span>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            required
          />
        </label>

        <label>
          <span>Category</span>

          <select
            value={categoryId}
            onChange={(event) =>
              setCategoryId(event.target.value)
            }
            required
          >
            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>SKU</span>

          <input
            type="text"
            value={sku}
            onChange={(event) =>
              setSku(event.target.value)
            }
            required
          />
        </label>

        <label>
          <span>Price (₦)</span>

          <input
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(event) =>
              setPrice(event.target.value)
            }
            required
          />
        </label>

        <label className="admin-product-form-full">
          <span>Description</span>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            rows={5}
            placeholder="Describe this product..."
          />
        </label>

        <label className="admin-product-active-toggle">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) =>
              setIsActive(event.target.checked)
            }
          />

          <span>
            Product is active and visible in the store
          </span>
        </label>

        {message && (
          <p className="admin-action-success">
            {message}
          </p>
        )}

        {error && (
          <p
            className="admin-login-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className="admin-save-button"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}