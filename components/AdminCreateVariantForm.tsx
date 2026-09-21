"use client";

import { FormEvent, useState } from "react";

type AdminCreateVariantFormProps = {
  productId: string;
};

export default function AdminCreateVariantForm({
  productId,
}: AdminCreateVariantFormProps) {
  const [size, setSize] = useState("");
  const [colour, setColour] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("0");
  const [price, setPrice] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/variants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            size,
            colour,
            sku,
            stock: Number(stock),
            price: price === "" ? null : Number(price),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create variant."
        );
      }

      setMessage("Variant added successfully.");

      setSize("");
      setColour("");
      setSku("");
      setStock("0");
      setPrice("");

      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create variant."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-variant-form"
      onSubmit={handleSubmit}
    >
      <div className="admin-form-grid">
        <div className="admin-form-field">
          <label htmlFor="variant-size">
            Size
          </label>

          <input
            id="variant-size"
            type="text"
            value={size}
            onChange={(event) =>
              setSize(event.target.value)
            }
            placeholder="e.g. 40"
            required
          />
        </div>

        <div className="admin-form-field">
          <label htmlFor="variant-colour">
            Colour
          </label>

          <input
            id="variant-colour"
            type="text"
            value={colour}
            onChange={(event) =>
              setColour(event.target.value)
            }
            placeholder="e.g. Black"
            required
          />
        </div>

        <div className="admin-form-field">
          <label htmlFor="variant-sku">
            SKU
          </label>

          <input
            id="variant-sku"
            type="text"
            value={sku}
            onChange={(event) =>
              setSku(event.target.value)
            }
            placeholder="e.g. TRC-TCS-001-40-BLK"
            required
          />
        </div>

        <div className="admin-form-field">
          <label htmlFor="variant-stock">
            Stock
          </label>

          <input
            id="variant-stock"
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(event) =>
              setStock(event.target.value)
            }
            required
          />
        </div>

        <div className="admin-form-field">
          <label htmlFor="variant-price">
            Price Override
          </label>

          <input
            id="variant-price"
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(event) =>
              setPrice(event.target.value)
            }
            placeholder="Leave blank to use product price"
          />

          <small>
            Optional. Leave blank if this variant uses
            the main product price.
          </small>
        </div>
      </div>

      {message && (
        <p className="admin-form-success">
          {message}
        </p>
      )}

      {error && (
        <p className="admin-form-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="admin-primary-action"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Adding Variant..."
          : "Add Variant"}
      </button>
    </form>
  );
}