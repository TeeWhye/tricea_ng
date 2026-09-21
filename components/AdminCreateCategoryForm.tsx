"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCreateCategoryForm() {
  const router = useRouter();

  const [name, setName] = useState("");
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
        "/api/admin/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create category."
        );
      }

      router.push("/admin/categories");
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
    <form
      className="admin-category-form"
      onSubmit={handleSubmit}
    >
      <div className="admin-category-form-body">
        <div className="admin-form-group">
          <label htmlFor="category-name">
            Category Name <span>*</span>
          </label>

          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="e.g. Luxury Slides"
            required
          />
        </div>
      </div>

      <div className="admin-category-form-actions">
        <button
          type="button"
          className="admin-secondary-action"
          onClick={() => router.push("/admin/categories")}
          disabled={isSaving}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="admin-primary-action"
          disabled={isSaving}
        >
          {isSaving
            ? "Creating Category..."
            : "Create Category"}
        </button>
      </div>

      {error && (
        <p className="admin-form-error">
          {error}
        </p>
      )}
    </form>
  );
}