import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import AdminCreateProductForm from "@/components/AdminCreateProductForm";

export default async function AdminProductsPage() {
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

  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      price: true,
      sku: true,
      isActive: true,
      category: {
        select: {
          name: true,
        },
      },
      variants: {
        select: {
          size: true,
          colour: true,
          stock: true,
        },
      },
    },
  });

  const productRows = products.map((product) => {
    const totalStock = product.variants.reduce(
      (total, variant) => total + variant.stock,
      0
    );

    const lowStockVariants = product.variants.filter(
      (variant) => variant.stock <= 2
    ).length;

    return {
      ...product,
      totalStock,
      lowStockVariants,
    };
  });

  return (
    <main className="admin-page">
      <div className="admin-page-inner">
        <header className="admin-header admin-products-header">
          <div>
            <Link
              href="/admin"
              className="admin-back-link"
            >
              ← Dashboard
            </Link>

            <p className="section-eyebrow">
              TRICEA NG · CATALOGUE
            </p>

            <h1>
              Store
              <br />
              Products.
            </h1>

            <p className="admin-header-description">
              Manage your footwear catalogue and inventory.
            </p>
          </div>
        </header>

        <section className="admin-products-section">
          <div className="admin-section-heading">
            <div>
              <p className="section-eyebrow">
                PRODUCT CATALOGUE
              </p>

              <h2>
                {products.length}{" "}
                {products.length === 1
                  ? "Product"
                  : "Products"}
              </h2>
            </div>

            <Link
  href="/admin/products/new"
  className="admin-primary-action"
>
  Add Product
</Link>
          </div>

          {productRows.length > 0 ? (
            <div className="admin-products-table-wrapper">
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Inventory</th>
                    <th>Status</th>
<th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {productRows.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="admin-product-name"
                        >
                          {product.name}
                        </Link>
                      </td>

                      <td>{product.category.name}</td>

                      <td>
                        <span className="admin-product-sku">
                          {product.sku}
                        </span>
                      </td>

                      <td>
                        ₦{product.price.toLocaleString("en-NG")}
                      </td>

                      <td>
                        <div className="admin-inventory-cell">
                          <strong>
                            {product.totalStock}
                          </strong>

                          <span>
                            {product.variants.length}{" "}
                            {product.variants.length === 1
                              ? "variant"
                              : "variants"}
                          </span>

                          {product.lowStockVariants > 0 && (
                            <small>
                              {product.lowStockVariants} low
                            </small>
                          )}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`admin-product-status ${
                            product.isActive
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {product.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>
                      <td>
  <Link
    href={`/admin/products/${product.id}`}
    className="admin-product-manage-link"
  >
    Manage →
  </Link>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-orders-empty">
              <h3>No products yet.</h3>

              <p>
                Products added to your catalogue will appear
                here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}