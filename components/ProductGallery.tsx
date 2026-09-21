"use client";

import { useState } from "react";

type ProductGalleryProps = {
  productName: string;
  images: {
    id: string;
    url: string;
    altText: string | null;
  }[];
};

export default function ProductGallery({
  productName,
  images,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = images[activeIndex];

  if (!activeImage) {
    return (
      <div className="product-gallery">
        <div className="product-image-placeholder">
          Tricea NG
        </div>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      <div className="product-gallery-main">
        <img
          src={activeImage.url}
          alt={activeImage.altText ?? productName}
        />
      </div>

      {images.length > 1 && (
        <div className="product-gallery-thumbnails">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={`product-gallery-thumbnail ${
                index === activeIndex ? "active" : ""
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
            >
              <img
                src={image.url}
                alt=""
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}