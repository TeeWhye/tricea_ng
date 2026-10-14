import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminCreateTestimonialForm from "@/components/AdminCreateTestimonialForm";
import AdminTestimonialsManager from "@/components/AdminTestimonialsManager";

export default async function AdminTestimonialsPage() {
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

  const testimonials = await prisma.testimonial.findMany({
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <div className="admin-page">
      <div className="admin-page-inner">
        <div className="admin-products-header">
          <div>
            <p className="product-eyebrow">STORE MANAGEMENT</p>
            <h1>Testimonials</h1>
            <p>
              Manage customer feedback displayed on the Tricea NG
              storefront.
            </p>
          </div>
        </div>

<AdminCreateTestimonialForm />
       <div className="admin-order-card">
  <div>
    <h2>All Testimonials</h2>

    <p>
      {testimonials.length}{" "}
      {testimonials.length === 1
        ? "testimonial"
        : "testimonials"}
    </p>
  </div>

  <AdminTestimonialsManager
    testimonials={testimonials}
  />
</div>
      </div>
    </div>
  );
}