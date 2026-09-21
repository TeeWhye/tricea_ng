"use client";

import { FormEvent, useState } from "react";

type AdminBulkVariantFormProps = {
  productId: string;
};

const AVAILABLE_SIZES = [
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
];

export default function AdminBulkVariantForm({
  productId,
}: AdminBulkVariantFormProps) {
  const [colour, setColour] = useState("");
  const [selectedSizes, setSelectedSizes] =
    useState<string[]>([]);
  const [stock, setStock] = useState("5");
  const [price, setPrice] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function toggleSize(size: string) {
    setSelectedSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size]
    );
  }

  function selectAllSizes() {
    setSelectedSizes(AVAILABLE_SIZES);
  }

  function clearSizes() {
    setSelectedSizes([]);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!colour.trim()) {
      setError("Please enter a colour.");
      return;
    }

    if (selectedSizes.length === 0) {
      setError("Please select at least one size.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/variants/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            colour,
            sizes: selectedSizes,
            stock: Number(stock),
            price:
              price === ""
                ? null
                : Number(price),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create variants."
        );
      }

      setMessage(data.message);

      setColour("");
      setSelectedSizes([]);
      setStock("5");
      setPrice("");

      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create variants."
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
          <label htmlFor="bulk-variant-colour">
            Colour
          </label>

          <input
            id="bulk-variant-colour"
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
          <label htmlFor="bulk-variant-stock">
            Stock per Size
          </label>

          <input
            id="bulk-variant-stock"
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
          <label htmlFor="bulk-variant-price">
            Price Override
          </label>

          <input
            id="bulk-variant-price"
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
            Leave blank to use the main product
            price.
          </small>
        </div>
      </div>

      <div className="admin-form-field admin-size-selector">
        <div className="admin-size-selector-header">
          <label>Sizes</label>

          <div className="admin-size-actions">
            <button
              type="button"
              onClick={selectAllSizes}
            >
              Select all
            </button>

            <button
              type="button"
              onClick={clearSizes}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="admin-size-options">
          {AVAILABLE_SIZES.map((size) => {
            const selected =
              selectedSizes.includes(size);

            return (
              <button
                key={size}
                type="button"
                className={
                  selected ? "selected" : ""
                }
                onClick={() =>
                  toggleSize(size)
                }
                aria-pressed={selected}
              >
                {size}
              </button>
            );
          })}
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
          ? "Creating Variants..."
          : `Create ${
              selectedSizes.length || ""
            } Variants`}
      </button>
    </form>
  );
}