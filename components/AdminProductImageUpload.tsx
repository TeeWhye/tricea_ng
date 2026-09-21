"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AdminProductImageUploadProps = {
  productId: string;
};

export default function AdminProductImageUpload({
  productId,
}: AdminProductImageUploadProps) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setMessage("");
    setError("");

    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select an image.");
      return;
    }

    setIsUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `/api/admin/products/${productId}/images`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to upload image."
        );
      }

      setMessage("Image uploaded successfully.");
      setFile(null);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="admin-image-upload">
      <div className="admin-form-field">
        <label htmlFor="product-image">
          Product Image
        </label>

        <input
          id="product-image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        <small>
          JPG, PNG, WEBP or other image formats. Maximum
          size: 5MB.
        </small>
      </div>

      {file && (
        <p className="admin-image-selected">
          Selected: {file.name}
        </p>
      )}

      <button
        type="button"
        className="admin-primary-action"
        onClick={handleUpload}
        disabled={!file || isUploading}
      >
        {isUploading ? "Uploading..." : "Upload Image"}
      </button>

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
    </div>
  );
}