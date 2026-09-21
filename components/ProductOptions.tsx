"use client";

import { useState } from "react";

type ProductVariant = {
  id: string;
  size: string;
  colour: string;
  sku: string;
  stock: number;
  price: number | null;
};

type ProductOptionsProps = {
  variants: ProductVariant[];
  onVariantChange: (variantId: string | null) => void;
};

function getColourSwatch(colour: string) {
  const normalized = colour.toLowerCase().trim();

  if (normalized.includes("black")) return "#1c1c1c";
  if (normalized.includes("green")) return "#4f6b4a";
  if (normalized.includes("olive")) return "#6b7048";
  if (normalized.includes("brown")) return "#76533f";
  if (normalized.includes("beige")) return "#d8c7aa";
  if (normalized.includes("cream")) return "#eee5d3";
  if (normalized.includes("white")) return "#f8f7f4";
  if (normalized.includes("burgundy")) return "#64152a";
  if (normalized.includes("red")) return "#9e2638";
  if (normalized.includes("pink")) return "#d8a0aa";
  if (normalized.includes("blue")) return "#526b83";

  return "#b7afa9";
}

export default function ProductOptions({
  variants,
  onVariantChange,
}: ProductOptionsProps) {
  const [selectedColour, setSelectedColour] = useState<string | null>(
    null
  );

  const [selectedSize, setSelectedSize] = useState<string | null>(
    null
  );

  const colours = Array.from(
    new Set(variants.map((variant) => variant.colour))
  ).sort();

  const filteredVariants = selectedColour
    ? variants.filter(
        (variant) => variant.colour === selectedColour
      )
    : variants;

  const sizes =
  colours.length > 1 && !selectedColour
    ? []
    : Array.from(
        new Set(filteredVariants.map((variant) => variant.size))
      ).sort();

  function handleColourSelect(colour: string) {
    setSelectedColour(colour);
    setSelectedSize(null);
    onVariantChange(null);
  }

  function handleSizeSelect(size: string) {
    const variant = filteredVariants.find(
      (item) => item.size === size
    );

    if (!variant || variant.stock <= 0) {
      return;
    }

    setSelectedSize(size);
    onVariantChange(variant.id);
  }

  return (
    <div className="product-page-option">
      {colours.length > 0 && (
  <div>
    <div className="product-option-header">
            <span>Colour</span>
          </div>

          <div className="colour-options">
            {colours.map((colour) => (
              <button
                key={colour}
                type="button"
                className={
                  selectedColour === colour ? "selected" : ""
                }
                onClick={() => handleColourSelect(colour)}
              >
                <span
                  className="colour-swatch"
                  style={{
                    backgroundColor: getColourSwatch(colour),
                  }}
                />

                <span>{colour}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="product-option-header">
  <span>
    Size{selectedColour ? ` — ${selectedColour}` : ""}
  </span>
  <a href="/size-guide">Size Guide</a>
</div>

     <div className="size-options">
  {colours.length > 1 && !selectedColour ? (
    <p className="size-selection-hint">
      Select a colour to view available sizes.
    </p>
  ) : (
    sizes.map((size) => {
      const variant = filteredVariants.find(
        (item) => item.size === size
      );

      const isOutOfStock =
        !variant || variant.stock <= 0;

      return (
            <button
              key={size}
              type="button"
              disabled={isOutOfStock}
              className={
                selectedSize === size ? "selected" : ""
              }
              onClick={() => handleSizeSelect(size)}
            >
              {size}
            </button>
          );
        })
      )}
    </div>
  </div>
);
}