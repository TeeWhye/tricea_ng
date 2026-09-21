import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import AdminProductForm from "@/components/AdminProductForm";
import AdminVariantStock from "@/components/AdminVariantStock";
import AdminCreateVariantForm from "@/components/AdminCreateVariantForm";
import AdminBulkVariantForm from "@/components/AdminBulkVariantForm";
import AdminDeleteVariantButton from "@/components/AdminDeleteVariantButton";
import AdminProductImageUpload from "@/components/AdminProductImageUpload";
import AdminSetPrimaryImageButton from "@/components/AdminSetPrimaryImageButton";
import AdminDeleteProductImageButton from "@/components/AdminDeleteProductImageButton";

type AdminProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminProductPage({
  params,
}: AdminProductPageProps) {
  const { id } = await params;

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

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      variants: {
        orderBy: [
          {
            size: "asc",
          },
          {
            colour: "asc",
          },
        ],
      },
    },
  });

  if (!product) {
    notFound();
  }

  const categories = await prisma.category.findMany({
  orderBy: {
    name: "asc",
  },
  select: {
    id: true,
    name: true,
  },
});

  const totalStock = product.variants.reduce(
    (total, variant) => total + variant.stock,
    0
  );

  const lowStockVariants = product.variants.filter(
    (variant) => variant.stock <= 2
  );

  return (
    <main className="admin-page">
      <div className="admin-page-inner">
        <header className="admin-product-detail-header">
          <Link
            href="/admin/products"
            className="admin-back-link"
          >
            ← All Products
          </Link>

          <div className="admin-product-detail-heading">
            <div>
              <p className="section-eyebrow">
                TRICEA NG · PRODUCT
              </p>

              <h1>{product.name}</h1>

              <p>{product.category.name}</p>
            </div>

            <span
              className={`admin-product-status ${
                product.isActive ? "active" : "inactive"
              }`}
            >
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </header>

        <div className="admin-product-detail-grid">
            <AdminProductForm
  product={{
    id: product.id,
    name: product.name,
    categoryId: product.categoryId,
    sku: product.sku,
    price: product.price,
    description: product.description,
    isActive: product.isActive,
  }}
  categories={categories}
/>
          <section className="admin-order-card admin-product-information">
            <div className="admin-order-card-heading">
              <p className="section-eyebrow">
                PRODUCT INFORMATION
              </p>
            </div>

            <div className="admin-customer-details">
              <div>
                <span>Name</span>
                <strong>{product.name}</strong>
              </div>

              <div>
                <span>Category</span>
                <strong>{product.category.name}</strong>
              </div>

              <div>
                <span>SKU</span>
                <strong>{product.sku}</strong>
              </div>

              <div>
                <span>Price</span>
                <strong>
                  ₦{product.price.toLocaleString("en-NG")}
                </strong>
              </div>

              <div>
                <span>Total Inventory</span>
                <strong>{totalStock}</strong>
              </div>

              <div>
                <span>Variants</span>
                <strong>{product.variants.length}</strong>
              </div>
            </div>

            {product.description && (
              <div className="admin-product-description">
                <span>Description</span>
                <p>{product.description}</p>
              </div>
            )}
          </section>

          <section className="admin-order-card">
  <div className="admin-order-card-heading">
    <p className="section-eyebrow">
      PRODUCT IMAGES
    </p>
  </div>

  <div className="admin-product-images">
  {product.images.length > 0 ? (
    product.images.map((image) => (
      <div
        key={image.id}
        className={`admin-product-image-item ${
          image.isPrimary ? "is-primary" : ""
        }`}
      >
        <img
          src={image.url}
          alt={
            image.altText ??
            product.name
          }
        />

        {image.isPrimary && (
          <span className="admin-image-primary-badge">
            Primary
          </span>
        )}

        <AdminSetPrimaryImageButton
          productId={product.id}
          imageId={image.id}
          isPrimary={image.isPrimary}
        />

        <AdminDeleteProductImageButton
  productId={product.id}
  imageId={image.id}
  isPrimary={image.isPrimary}
/>
      </div>
    ))
  ) : (
    <div className="product-image-placeholder">
      Tricea NG
    </div>
  )}
</div>

  <AdminProductImageUpload
    productId={product.id}
  />
</section>

          <section className="admin-order-card admin-product-inventory">
            <div className="admin-order-card-heading">
              <div>
                <p className="section-eyebrow">
                  INVENTORY
                </p>
              </div>

              <span>
                {totalStock} units
              </span>
            </div>

            {lowStockVariants.length > 0 && (
              <div className="admin-low-stock-notice">
                {lowStockVariants.length}{" "}
                {lowStockVariants.length === 1
                  ? "variant is"
                  : "variants are"}{" "}
                low on stock.
              </div>
            )}

            <div className="admin-section">
  <div className="admin-section-heading">
    <div>
      <p className="admin-section-eyebrow">
        PRODUCT VARIANTS
      </p>

      <h2>Add Variant</h2>
    </div>
  </div>

  <AdminCreateVariantForm productId={product.id} />
</div>

<div className="admin-section">
  <div className="admin-section-heading">
    <div>
      <p className="admin-section-eyebrow">
        BULK CREATION
      </p>

      <h2>Create Multiple Variants</h2>
    </div>
  </div>

  <AdminBulkVariantForm productId={product.id} />
</div>

            <div className="admin-variant-table-wrapper">
              <table className="admin-variant-table">
                <thead>
  <tr>
    <th>Size</th>
<th>Colour</th>
<th>SKU</th>
<th>Price</th>
<th>Stock</th>
<th>Actions</th>
  </tr>
</thead>

                <tbody>
                  {product.variants.map((variant) => (
                    <tr key={variant.id}>
                      <td>{variant.size}</td>

<td>{variant.colour}</td>

<td>
  <span className="admin-product-sku">
    {variant.sku}
  </span>
</td>

<td>
  {variant.price !== null
    ? `₦${variant.price.toLocaleString("en-NG")}`
    : `₦${product.price.toLocaleString("en-NG")}`}
</td>

<td>
  <AdminVariantStock
    productId={product.id}
    variantId={variant.id}
    initialStock={variant.stock}
  />
</td>

<td>
  <div className="admin-variant-actions">
    <Link
      href={`/admin/products/${product.id}/variants/${variant.id}/edit`}
      className="admin-secondary-action"
    >
      Edit
    </Link>

    <AdminDeleteVariantButton
      productId={product.id}
      variantId={variant.id}
    />
  </div>
</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}