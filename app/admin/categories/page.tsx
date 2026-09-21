import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
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
    return null;
  }

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="section-eyebrow">
            PRODUCT MANAGEMENT
          </p>

          <h1>Categories</h1>

          <p>
            Organise your products into collections
            customers can browse.
          </p>
        </div>

        <Link
          href="/admin/categories/new"
          className="admin-primary-action"
        >
          Add Category
        </Link>
      </div>

      <section className="admin-order-card">
        <div className="admin-order-card-heading">
          <div>
            <p className="section-eyebrow">
              ALL CATEGORIES
            </p>

            <h2>
              {categories.length}{" "}
              {categories.length === 1
                ? "Category"
                : "Categories"}
            </h2>
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Products</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <strong>
                        {category.name}
                      </strong>
                    </td>

                    <td>{category.slug}</td>

                    <td>
                      {category._count.products}
                    </td>

                    <td>
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="admin-secondary-action"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-empty-state">
            No categories have been created yet.
          </p>
        )}
      </section>
    </main>
  );
}