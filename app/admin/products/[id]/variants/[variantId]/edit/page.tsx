import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import AdminEditVariantForm from "@/components/AdminEditVariantForm";

type EditVariantPageProps = {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
};

export default async function EditVariantPage({
  params,
}: EditVariantPageProps) {
  const { id, variantId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: user.id,
    },
    select: {
      role: true,
    },
  });

  if (!profile || profile.role !== "ADMIN") {
    redirect("/");
  }

  const variant =
    await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId: id,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

  if (!variant) {
    notFound();
  }

  return (
    <main className="admin-page">
      <div className="admin-page-inner">
        <header className="admin-product-detail-header">
          <Link
            href={`/admin/products/${id}`}
            className="admin-back-link"
          >
            ← Back to Product
          </Link>

          <div className="admin-product-detail-heading">
            <div>
              <p className="section-eyebrow">
                TRICEA NG · VARIANT
              </p>

              <h1>Edit Variant</h1>

              <p>{variant.product.name}</p>
            </div>
          </div>
        </header>

        <section className="admin-order-card">
          <div className="admin-order-card-heading">
            <div>
              <p className="section-eyebrow">
                VARIANT DETAILS
              </p>

              <h2>
                {variant.colour} · Size{" "}
                {variant.size}
              </h2>
            </div>
          </div>

          <div className="admin-variant-edit-summary">
            <div>
              <span>Current SKU</span>
              <strong>{variant.sku}</strong>
            </div>

            <div>
              <span>Current Stock</span>
              <strong>{variant.stock}</strong>
            </div>

            <div>
              <span>Product Price</span>
              <strong>
                ₦
                {variant.product.price.toLocaleString(
                  "en-NG"
                )}
              </strong>
            </div>

            <div>
              <span>Variant Price</span>
              <strong>
                {variant.price !== null
                  ? `₦${variant.price.toLocaleString(
                      "en-NG"
                    )}`
                  : "Uses product price"}
              </strong>
            </div>
          </div>

          <AdminEditVariantForm
  productId={variant.product.id}
  variantId={variant.id}
  initialSize={variant.size}
  initialColour={variant.colour}
  initialSku={variant.sku}
  initialPrice={variant.price}
  productPrice={variant.product.price}
/>
        </section>
      </div>
    </main>
  );
}