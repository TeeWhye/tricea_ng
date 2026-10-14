-- Add an optional hash for secure guest order tracking.
-- Existing orders remain valid because the column is nullable.

ALTER TABLE "Order"
ADD COLUMN "trackingTokenHash" TEXT;

-- Index hashes to support secure token verification.
CREATE UNIQUE INDEX "Order_trackingTokenHash_key"
ON "Order"("trackingTokenHash");