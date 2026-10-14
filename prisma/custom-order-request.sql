-- CreateEnum
CREATE TYPE "CustomRequestStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'QUOTED', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateTable
CREATE TABLE "CustomOrderRequest" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "profileId" UUID,
    "productId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "preferredSize" TEXT NOT NULL,
    "preferredColour" TEXT NOT NULL,
    "customSpecifications" TEXT,
    "status" "CustomRequestStatus" NOT NULL DEFAULT 'PENDING',
    "quotedPrice" INTEGER,
    "adminNotes" TEXT,
    "customerNotes" TEXT,
    "accessTokenHash" TEXT NOT NULL,
    "quoteExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomOrderRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomOrderRequest_reference_key" ON "CustomOrderRequest"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "CustomOrderRequest_accessTokenHash_key" ON "CustomOrderRequest"("accessTokenHash");

-- CreateIndex
CREATE INDEX "CustomOrderRequest_profileId_idx" ON "CustomOrderRequest"("profileId");

-- CreateIndex
CREATE INDEX "CustomOrderRequest_productId_idx" ON "CustomOrderRequest"("productId");

-- CreateIndex
CREATE INDEX "CustomOrderRequest_status_idx" ON "CustomOrderRequest"("status");

-- CreateIndex
CREATE INDEX "CustomOrderRequest_createdAt_idx" ON "CustomOrderRequest"("createdAt");

-- CreateIndex
CREATE INDEX "CustomOrderRequest_email_idx" ON "CustomOrderRequest"("email");

-- AddForeignKey
ALTER TABLE "CustomOrderRequest" ADD CONSTRAINT "CustomOrderRequest_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderRequest" ADD CONSTRAINT "CustomOrderRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
