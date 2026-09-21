"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminVariantStockProps = {
  productId: string;
  variantId: string;
  initialStock: number;
};

export default function AdminVariantStock({
  productId,
  variantId,
  initialStock,
}: AdminVariantStockProps) {
  const router = useRouter();

  const [stock, setStock] = useState(
    initialStock.toString()
  );

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSave() {
    setIsSaving(true);
    setMessage("");
    setError("");

    const parsedStock = Number(stock);

    if (
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      setError("Stock must be a whole number of 0 or more.");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/variants/${variantId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stock: parsedStock,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update stock."
        );
      }

      setMessage("Saved.");

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
    <div className="admin-stock-editor">
      <div className="admin-stock-input-wrapper">
        <input
          type="number"
          min="0"
          step="1"
          value={stock}
          onChange={(event) =>
            setStock(event.target.value)
          }
          aria-label="Variant stock"
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "..." : "Save"}
        </button>
      </div>

      {message && (
        <span className="admin-stock-message">
          {message}
        </span>
      )}

      {error && (
        <span className="admin-stock-error">
          {error}
        </span>
      )}
    </div>
  );
}