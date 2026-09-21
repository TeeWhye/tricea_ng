import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import AdminCreateCategoryForm from "@/components/AdminCreateCategoryForm";

export default async function NewCategoryPage() {
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

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="section-eyebrow">
            PRODUCT MANAGEMENT
          </p>

          <h1>Add Category</h1>

          <p>
            Create a new category for your Tricea
            products.
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
              Enter the name of the new category. A
              URL-friendly slug will be generated
              automatically.
            </p>
          </div>
        </div>

        <AdminCreateCategoryForm />
      </section>
    </main>
  );
}