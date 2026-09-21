"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type AdminCreateProductFormProps = {
  categories: Category[];
};

export default function AdminCreateProductForm({
  categories,
}: AdminCreateProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(
    categories[0]?.id ?? ""
  );
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",
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
          data.message || "Unable to create product."
        );
      }

      router.push(`/admin/products/${data.product.id}`);
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
    <main className="admin-page">
      <div className="admin-page-inner">
        <header className="admin-products-header">
          <div>
            <button
              type="button"
              className="admin-back-link admin-back-button"
              onClick={() =>
                router.push("/admin/products")
              }
            >
              ← All Products
            </button>

            <p className="section-eyebrow">
              TRICEA NG · CATALOGUE
            </p>

            <h1>
              Add
              <br />
              Product.
            </h1>

            <p className="admin-header-description">
              Add a new product to your footwear catalogue.
            </p>
          </div>
        </header>

        <section className="admin-order-card admin-create-product-card">
          <div className="admin-order-card-heading">
            <p className="section-eyebrow">
              PRODUCT INFORMATION
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
                placeholder="e.g. Classic Leather Slide"
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
                placeholder="e.g. TRC-CLS-001"
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
                placeholder="35000"
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
                rows={6}
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
              {isSaving
                ? "Creating Product..."
                : "Create Product"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}