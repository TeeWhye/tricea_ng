import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import AdminEditCategoryForm from "@/components/AdminEditCategoryForm";
import AdminDeleteCategoryButton from "@/components/AdminDeleteCategoryButton";

export default async function AdminCategoryDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

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

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="section-eyebrow">
            PRODUCT MANAGEMENT
          </p>

          <h1>Manage Category</h1>

          <p>
            Update the details of this product category.
          </p>
        </div>

        <Link
          href="/admin/categories"
          className="admin-secondary-action"
        >
          ← Back to Categories
        </Link>
      </div>

      <section className="admin-category-card">
        <div className="admin-category-card-heading">
          <div>
            <p className="section-eyebrow">
              CATEGORY DETAILS
            </p>

            <p className="admin-category-card-description">
              Edit the category name. The URL-friendly
              slug will update automatically.
            </p>
          </div>
        </div>

        <div className="admin-category-summary">
          <div>
            <span>Current Slug</span>
            <strong>{category.slug}</strong>
          </div>

          <div>
            <span>Products</span>
            <strong>{category._count.products}</strong>
          </div>
        </div>

        <AdminEditCategoryForm
          categoryId={category.id}
          initialName={category.name}
        />

        <div className="admin-category-delete">
  <div>
    <p className="section-eyebrow">
      DANGER ZONE
    </p>

    <p>
      Delete this category if it is no longer needed.
      Categories containing products cannot be deleted.
    </p>
  </div>

  <AdminDeleteCategoryButton
    categoryId={category.id}
    categoryName={category.name}
    productCount={category._count.products}
  />
</div>

      </section>
    </main>
  );
}