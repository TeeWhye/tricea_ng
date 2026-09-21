"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AdminEditVariantFormProps = {
  productId: string;
  variantId: string;
  initialSize: string;
  initialColour: string;
  initialSku: string;
  initialPrice: number | null;
  productPrice: number;
};

export default function AdminEditVariantForm({
  productId,
  variantId,
  initialSize,
  initialColour,
  initialSku,
  initialPrice,
  productPrice,
}: AdminEditVariantFormProps) {
  const router = useRouter();

  const [size, setSize] = useState(initialSize);
  const [colour, setColour] =
    useState(initialColour);
  const [sku, setSku] = useState(initialSku);
  const [price, setPrice] = useState(
    initialPrice?.toString() ?? ""
  );

  const [isSaving, setIsSaving] =
    useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!size.trim()) {
      setError("Size is required.");
      return;
    }

    if (!colour.trim()) {
      setError("Colour is required.");
      return;
    }

    if (!sku.trim()) {
      setError("SKU is required.");
      return;
    }

    let parsedPrice: number | null = null;

    if (price.trim() !== "") {
      parsedPrice = Number(price);

      if (
        !Number.isInteger(parsedPrice) ||
        parsedPrice < 0
      ) {
        setError(
          "Price must be a whole number of 0 or more."
        );
        return;
      }
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/variants/${variantId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            size: size.trim(),
            colour: colour.trim(),
            sku: sku.trim(),
            price: parsedPrice,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update variant."
        );
      }

      setMessage(
        "Variant updated successfully."
      );

      router.replace(
  `/admin/products/${productId}/variants/${variantId}/edit`
);

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
    <form
      className="admin-variant-form"
      onSubmit={handleSubmit}
    >
      <div className="admin-form-grid">
        <div className="admin-form-field">
          <label htmlFor="edit-variant-size">
            Size
          </label>

          <input
            id="edit-variant-size"
            type="text"
            value={size}
            onChange={(event) =>
              setSize(event.target.value)
            }
            required
          />
        </div>

        <div className="admin-form-field">
          <label htmlFor="edit-variant-colour">
            Colour
          </label>

          <input
            id="edit-variant-colour"
            type="text"
            value={colour}
            onChange={(event) =>
              setColour(event.target.value)
            }
            required
          />
        </div>

        <div className="admin-form-field">
          <label htmlFor="edit-variant-sku">
            SKU
          </label>

          <input
            id="edit-variant-sku"
            type="text"
            value={sku}
            onChange={(event) =>
              setSku(event.target.value)
            }
            required
          />
        </div>

        <div className="admin-form-field">
          <label htmlFor="edit-variant-price">
            Price Override
          </label>

          <input
            id="edit-variant-price"
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(event) =>
              setPrice(event.target.value)
            }
            placeholder="Use product price"
          />

          <small>
            Leave blank to use the product price of ₦
            {productPrice.toLocaleString("en-NG")}.
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

      <div className="admin-form-actions">
        <button
          type="submit"
          className="admin-primary-action"
          disabled={isSaving}
        >
          {isSaving
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
}