CREATE TABLE "Testimonial" (
    "id" UUID NOT NULL,
    "customerName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "productName" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Testimonial_isPublished_sortOrder_idx"
ON "Testimonial"("isPublished", "sortOrder");

CREATE INDEX "Testimonial_isFeatured_idx"
ON "Testimonial"("isFeatured");

CREATE INDEX "Testimonial_createdAt_idx"
ON "Testimonial"("createdAt");