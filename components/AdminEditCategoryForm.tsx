"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminEditCategoryFormProps = {
  categoryId: string;
  initialName: string;
};

export default function AdminEditCategoryForm({
  categoryId,
  initialName,
}: AdminEditCategoryFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialName);
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
        `/api/admin/categories/${categoryId}`,
        {
          method: "PATCH",
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
            "Unable to update category."
        );
      }

      setMessage("Category updated successfully.");

      router.replace(
        `/admin/categories/${categoryId}`
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
            required
          />
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

      <div className="admin-category-form-actions">
        <button
          type="button"
          className="admin-secondary-action"
          onClick={() =>
            router.push("/admin/categories")
          }
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
            ? "Saving Changes..."
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
}